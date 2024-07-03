from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from decorators import authenticate, authorize


import speech_recognition as sr
from models import Project, Session, Analysis
from init import db
from pydub import AudioSegment
import json
import assemblyai as aai
from .fileRoutes import getTeamim
import io
import base64
import wave
import tempfile

#for teamim
import librosa
import soundfile as sf
import os

import numpy as np
import concurrent.futures
from fastdtw import fastdtw

from scipy.spatial.distance import euclidean


#needed for transcription with assemblyai
aai.settings.api_key = "0dc55bacc27c4f6786439e81b735f87a"


def init_analysis_routes(app, recordings):
    @app.route("/analysis/<int:session_id>", methods=["GET"])
    def forAnalysis(session_id):
        print("Started")
        session = Session.query.get(session_id)
        if session.recording is None:
            if session_id in recordings:
                session.recording = recordings[session_id]
                #with open('output_audio.wav', 'wb') as output_file:
                #    output_file.write(session.recording)
                recordings.pop(session_id)
            else:
                return jsonify({"analysis": [], 'created_at': "", "url": "", "project_url":"", "score": 0, "teamin_stats":{}}), 200
        
        if  session.analysis_id is not None:
            analysis = Analysis.query.get(session.analysis_id)
            return jsonify({"analysis": get_time_json(json.loads(analysis.teamim)), 'created_at': analysis.created_at, "url": session.url,
             "project_url": Project.query.get(session.project_id).sample_url, "score": 80}), 200

        audio_file_like = io.BytesIO(session.recording)
        audio = AudioSegment.from_file(audio_file_like)
        duration_seconds = audio.duration_seconds

        print("for teamim")
        project = Project.query.get(session.project_id)
        print("for teamim2")
        if session.session_teamim is None:
            teamim = getTeamim(session.recording, duration_seconds, project.parasha_ref_clean.text, project.parasha_ref_mark.text)
            session.session_teamim = json.dumps(teamim)

        print("started analysis")
        ans_analysis = compare(project.sample_clip, session.recording, json.loads(session.session_teamim), json.loads(project.sample_teamim))
        #first comes the teacher
        taam_stats = taam_performance(json.loads(project.sample_teamim),json.loads(session.session_teamim))
        print(f"teamim status: {taam_stats}")
        analysis = Analysis(json.dumps(ans_analysis))
        session.analysis = analysis
        session.analysis_id = analysis.id
        db.session.add(analysis)
        db.session.commit()
        #TODO: add total score.
        return jsonify({"analysis": get_time_json(ans_analysis), "url": session.url, "project_url": project.sample_url, "score": 80, "teamin_stats": taam_stats})
                    

def getMatchTeamim(user_teamim, sample_teamim):
    missing_words = sample_teamim.copy()
    matching_elements_session = []
    matching_elements_sample = []
    wrong_words = []

    #for offsetting
    place_check = []
    offset_words = 0
    nonesense_words = 0


    for i in range(0, len(user_teamim)):
        if user_teamim[i]['broken']:
            wrong_words.append(user_teamim[i])

        else:
            sample_delete = None
            row = user_teamim[i]

            for j in range(i, len(sample_teamim)):
                row2 = sample_teamim[j]
                if row['text'] == row2['text'] and j not in place_check:
                    if j != i + offset_words + nonesense_words and j != i + offset_words - nonesense_words:
                        row['word_status'] = 1
                        rep = i+offset_words
                        while sample_teamim[rep]['broken'] and rep > 0:
                            rep = rep - 1

                        row['word_to_say'] = sample_teamim[rep]['text']
                        offset_words = j-i
                    else:
                        row['word_to_say'] = ""
                        row['word_status'] = 0

                    matching_elements_session.append(row)
                    matching_elements_sample.append(row2)
                    sample_delete = row2
                    place_check.append(j)
                    break
            if sample_delete is not None:
                missing_words.remove(sample_delete)

    return matching_elements_session, matching_elements_sample, missing_words, wrong_words


def compare(sample_wav, user_wav, user_json, sample_json):
    matching_elements_session, matching_elements_sample, missing_words, wrong_words = getMatchTeamim(user_json, sample_json)
    analysis, score = process_recordings(sample_wav, user_wav, matching_elements_sample, matching_elements_session)
    print(f"FINAL SCORE IS: {score}")
    #those jsons are words that were said by the sample but where not found in the user recording
    last_place = 0
    place_not_found = []
    combined = []
    print(analysis)
    for row in missing_words:
        if not row['broken']:
            row['word_status'] = 3
            row['taam_status'] = 'MISSING'
            row['exp'] = "פיספסת את הטעם בזמן הביצוע שלך"
            row['word_to_say'] = ""
            row['rav_start'] = row['start']
            row['rav_end'] = row['end']
            row['start'] = 0.0
            row['end'] = 0.0
            found = False
            for i in range(last_place, len(analysis)):
                if analysis[i]['word_status'] == 1 and analysis[i]['word_to_say'] == row['text']:
                    analysis.insert(i, row)
                    add_forward = 0
                    add_backword = 0
                    for word in place_not_found:
                        if word['rav_end'] == row['rav_start']:
                            analysis.insert(i-add_backword, word)
                            add_backword = add_backword + 1
                            combined.append(word)
                        elif word['rav_start'] == row['rav_end']:
                            analysis.insert(i+add_forward, word)
                            add_forward = add_forward + 1
                            combined.append(word)

                    last_place = i + 1 + add_forward + add_backword + 1
                    found = True
                    break
            if not found:
                place_not_found.append(row)
        #analysis.append(row)

    for row in wrong_words:
        row['word_status'] = 2
        row['taam_status'] = ''
        row['exp'] = "המילה שאמרת אינה מופיעה בהקלטת הרב"
        row['word_to_say'] = ""
        row['rav_start'] = 0.0
        row['rav_end'] = 0.0
        analysis.append(row)
    return analysis

def get_time_json(analysis):#should be mm:ss:mm for start, end, rav_start, rav_end
    for word in analysis:
        word['start'] = get_time(word['start'])
        word['end'] = get_time(word['end'])
        word['rav_start'] = get_time(word['rav_start'])
        word['rav_end'] = get_time(word['rav_end'])
    return analysis

def get_time(time):
    minute = int(time//60)
    time = time % 60
    second = int(time // 1)
    time = time % 1 
    milli = int(time*100)
    return "{:02d}:{:02d}:{:02d}".format(minute, second, milli)



#for analysis of teamim

def midi_to_note_name(midi_number):
    note_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    octave = midi_number // 12 - 1
    note_name = note_names[midi_number % 12]
    return f"{note_name}{octave}"


def note_name_to_midi(note_name):
    note_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    name, octave = note_name[:-1], int(note_name[-1])
    midi_number = note_names.index(name) + (octave + 1) * 12
    return midi_number


def hz_to_midi(hz):
    return int(69 + 12 * np.log2(hz / 440.0))


def extract_pitch_array(audio_data, sr=22050):
    y, sr = librosa.load(io.BytesIO(audio_data), sr=sr)
    pitches, magnitudes = librosa.core.piptrack(y=y, sr=sr)
    pitch_array = []

    for t in range(pitches.shape[1]):
        index = magnitudes[:, t].argmax()
        pitch = pitches[index, t]
        if pitch > 0:
            midi_note = hz_to_midi(pitch)
            note_name = midi_to_note_name(midi_note)
            pitch_array.append(note_name)
        else:
            pitch_array.append('Rest')
    return np.array(pitch_array)


def note_array_to_midi(note_array):
    return np.array([note_name_to_midi(note) for note in note_array if note != 'Rest'])


def calculate_similarity_score(pitch_array_teacher, pitch_array_student):
    midi_teacher = note_array_to_midi(pitch_array_teacher)
    midi_student = note_array_to_midi(pitch_array_student)

    min_len = min(len(midi_teacher), len(midi_student))
    midi_teacher = midi_teacher[:min_len]
    midi_student = midi_student[:min_len]

    manhattan_dist = lambda x, y: np.abs(x - y)
    distance, _ = fastdtw(midi_teacher, midi_student, dist=manhattan_dist)

    max_distance = 1000  # Assume 1000 as the maximum possible DTW distance for normalization
    score = max(0, 100 - (distance / max_distance) * 100)
    return score


def give_feedback(pitch_array_teacher, pitch_array_student):
    length = min(len(pitch_array_teacher), len(pitch_array_student))
    third = length // 3

    segments = {
        "התחלה, ": (0, third),
        "אמצע, ": (third, 2 * third),
        "סוף, ": (2 * third, length)
    }

    feedback = ""

    overall_score = 0

    for segment, (start, end) in segments.items():
        score = calculate_similarity_score(pitch_array_teacher[start:end], pitch_array_student[start:end])
        feedback += f"{segment.capitalize()} ציון: {score:.2f}. "

        if score > 90:
            feedback += "מעולה דומה מאוד למורה, "
        elif score > 70:
            feedback += "ניסיון יפה, דרוש עבודה על התזמון והגייה, "
        else:
            feedback += ".יש המון מקום לשיפור, נסה שוב "
        overall_score = overall_score + score

        teacher_midi_segment = note_array_to_midi(pitch_array_teacher[start:end])
        student_midi_segment = note_array_to_midi(pitch_array_student[start:end])

        if np.mean(student_midi_segment) < np.mean(teacher_midi_segment):
            feedback += "תרים את הסולם קול "
        else:
            feedback += "תוריד את הסולם קול "

        if np.var(student_midi_segment) < np.var(teacher_midi_segment):
            feedback += "ותוסיף סלסול לקול "
        else:
            feedback += "ונסה לשמור על אותו קול "

        feedback += "\n"

    overall_score = overall_score / 3
    feedback += f"ציון סופי : {overall_score:.2f}. "

    if overall_score > 90:
        feedback += "ביצוע מעולה"
    elif overall_score > 70:
        feedback += "ביצוע טוב, יש מקום לשיפור"
    else:
        feedback += "ביצוע לא טוב, נסה שוב"

    return feedback, overall_score


def crop_audio(input_data, start_time, end_time):
    y, sr = librosa.load(io.BytesIO(input_data), sr=None, offset=start_time, duration=end_time-start_time)
    output = io.BytesIO()
    sf.write(output, y, sr, format='wav')
    return output.getvalue()

def taam_performance(teacher_data, student_data):
    taam_stats = {
        'etnach': {'correct_count': 0, 'total_count': 0},
        'segolta': {'correct_count': 0, 'total_count': 0},
        'shalshelet': {'correct_count': 0, 'total_count': 0},
        'zaqef katan': {'correct_count': 0, 'total_count': 0},
        'zaqef gadol': {'correct_count': 0, 'total_count': 0},
        'maarih tarha': {'correct_count': 0, 'total_count': 0},
        'sof pasuk': {'correct_count': 0, 'total_count': 0},
        'revia': {'correct_count': 0, 'total_count': 0},
        'trei kadmin': {'correct_count': 0, 'total_count': 0},
        'kadma': {'correct_count': 0, 'total_count': 0},
        'tevir': {'correct_count': 0, 'total_count': 0},
        'gerish': {'correct_count': 0, 'total_count': 0},
        'shene gereshin': {'correct_count': 0, 'total_count': 0},
        'talsha': {'correct_count': 0, 'total_count': 0},
        'pazer gadol': {'correct_count': 0, 'total_count': 0},
        'darga': {'correct_count': 0, 'total_count': 0},
        'azla': {'correct_count': 0, 'total_count': 0},
        'zarqa': {'correct_count': 0, 'total_count': 0},
        'pasek': {'correct_count': 0, 'total_count': 0}
    }
    min_len = min(len(teacher_data), len(student_data))
    for i in range(min_len):
        teacher = teacher_data[i]
        student = student_data[i]

        if 'taam' in teacher and 'taam' in student:
            if teacher['taam'] in taam_stats:
                taam = teacher['taam']
                
                if taam == 'etnach':
                    # Calculate downtime percentage after the word
                    if i < len(teacher_data) - 1:
                        teacher_downtime = teacher_data[i + 1]['start'] - teacher['end']
                        student_downtime = student_data[i + 1]['start'] - student['end']
                        if teacher_downtime > 0 and student_downtime > 0:
                            downtime_ratio = student_downtime / teacher_downtime
                            if 0.8 <= downtime_ratio <= 1.2:
                                taam_stats[taam]['correct_count'] += 1
                            taam_stats[taam]['total_count'] += 1
                elif taam == 'revia' or taam == 'trei kadmin' or taam == 'pazer gadol':
                    # Check how much time the word took
                    teacher_word_time = teacher['end'] - teacher['start']
                    student_word_time = student['end'] - student['start']
                    time_ratio = student_word_time / teacher_word_time
                    if 0.8 <= time_ratio <= 1.2:
                        taam_stats[taam]['correct_count'] += 1
                    taam_stats[taam]['total_count'] += 1
                # Add more rules for other taamim

    taamim_feedback = {taam: (stats['correct_count'], stats['total_count']) for taam, stats in taam_stats.items()}
    return taamim_feedback


def process_recordings(teacher_audio_data, student_audio_data, teacher_data, student_data):
    output = []
    print(f"student data: {student_data}")
    print(f"teacher data: {teacher_data}")
    len_teacher = len(teacher_data)
    total_score = 0

    for i in range(len_teacher):
        if i >= len(student_data) or teacher_data[i]['text'] != student_data[i]['text']:
            output.append({'text': teacher_data[i]['text'], 'state': 'MISSING'})
        else:
            temp_teacher_audio = crop_audio(teacher_audio_data, teacher_data[i]['start'], teacher_data[i]['end'])
            temp_student_audio = crop_audio(student_audio_data, student_data[i]['start'], student_data[i]['end'])

            teacher_pitch_array = extract_pitch_array(temp_teacher_audio)
            student_pitch_array = extract_pitch_array(temp_student_audio)

            feedback, score = give_feedback(teacher_pitch_array, student_pitch_array)
            total_score += score
            if score > 90:
                review = "GOOD"
            elif score > 70:
                review = "MEDIUM"
            else:
                review = "BAD"

            #ans
            student_data[i]['exp'] = feedback
            student_data[i]['rav_start'] = teacher_data[i]['start']
            student_data[i]['rav_end'] = teacher_data[i]['end']
            student_data[i]['taam_status'] = review

            output.append(student_data[i])
    average_score = total_score / len_teacher if len_teacher > 0 else 0
    return output, average_score
