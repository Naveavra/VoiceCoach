from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from decorators import authenticate, authorize

import speech_recognition as sr
from models import Project, Session, Analysis
from init import db
from pydub import AudioSegment
import json
import assemblyai as aai
from .fileRoutes import get_words_by_google, getTeamim, fixTeamimWithWords

import io
import base64
import wave
import tempfile

#for teamim
import librosa
import pyloudnorm
import soundfile as sf
from scipy.signal import correlate
from audio_similarity import AudioSimilarity
from scipy.spatial.distance import euclidean
from fastdtw import fastdtw
import pyloudnorm as pyln
import os
from scipy.spatial.distance import cdist
import numpy as np

#needed for transcription with assemblyai
aai.settings.api_key = "0dc55bacc27c4f6786439e81b735f87a"

def init_analysis_routes(app):
    @app.route("/analysis/<int:session_id>", methods=["GET"])
    @jwt_required()
    @authenticate
    def forAnalysis(current_user, session_id):
        return getAnalysis(session_id)
    #def forAnalysis(session_id):
                    

def getAnalysis(session_id):
    session = Session.query.get(session_id)
    print(session.analysis_id)
    if  session.analysis_id is not None:
        return jsonify(Analysis.query.get(session.analysis_id).simpleSerialize()), 200

    words = session.session_lines
    print(words)
    description = ""
    project = Project.query.get(session.project_id)


    user_lines = words.split(',')
    sample_lines = project.sample_lines.split(',')

    lines_length = min(len(user_lines), len(sample_lines))
    wordsMismatch = []
    google_txt = ""
    for i in range(0, lines_length):
        google_txt = google_txt + " " + user_lines[i]
        line_wordsMismatch = compare_line(user_lines[i], sample_lines[i])
        wordsMismatch.extend(line_wordsMismatch)

    print(wordsMismatch)

    print("teamim")
    if session.session_teamim is None:
        teamim = getTeamim(session.recording)
        teamim = fixTeamimWithWords(teamim, words)
        session.session_teamim = json.dumps(teamim)
        db.session.commit()

    tmp_sample = json.loads(project.sample_teamim)
    matching_elements_session = []
    matching_elements_sample = []

    # Iterate over both lists and compare elements at the same position
    for row in json.loads(session.session_teamim):
        delete = None
        for row2 in tmp_sample:
            if row['text'] == row2['text']:
                matching_elements_session.append(row)
                matching_elements_sample.append(row2)
                delete = row2
                break
        if delete is not None:
            tmp_sample.remove(delete)
    print("fixed")

    ans_teamim = analyze_recordings(session.recording, project.sample_clip, matching_elements_session, matching_elements_sample)
    for row in tmp_sample:
        print(row)
        row['review'] = 'MISSING'
        ans_teamim.append(row)
    analysis = Analysis(json.dumps(words), json.dumps(ans_teamim))
    session.analysis = analysis
    session.analysis_id = analysis.id
    db.session.add(analysis)
    db.session.commit()
    # words: (word, result, replace),... | teamim: {word: ,start: ,end: ,review: }
    return jsonify({"words" : wordsMismatch, "teamim" : ans_teamim}), 200
        


def compare_line(user_line, sample_line):
    user_words = user_line.split(' ')
    sample_words = sample_line.split(' ')

    wordsMismatch = []
    places_counted = []
    num_words = min(len(user_words), len(sample_words))
    nonsense_words = 0
    offset_words = 0
    for i in range(0, num_words):
        if user_words[i] not in sample_words:
            wordsMismatch.append((user_words[i], 2, user_words[i]))
            nonsense_words  = nonsense_words + 1

        elif (i - offset_words > 0 and user_words[i] != sample_words[i-offset_words]) and (i + offset_words < len(sample_words) and user_words[i] != sample_words[i+offset_words]):
            addOffset = 0
            for add in range(i, len(sample_words)):
                if sample_words[add] == user_words[i]:
                    addOffset = add - i
                    break
            wordsMismatch.append((user_words[i], 1, sample_words[i]))
            offset_words = offset_words + addOffset

        else:
            wordsMismatch.append((user_words[i], 0, user_words[i]))
            if user_words[i] == sample_words[i]:
                places_counted.append(i)
            elif (i - offset_words > 0 and user_words[i] == sample_words[i-offset_words]):
                places_counted.append(i-offset_words)
            elif (i + offset_words < len(sample_words) and user_words[i] == sample_words[i+offset_words]):
                places_counted.append(i+offset_words)
    for i in range(0, len(sample_words)):
        if i not in places_counted:
            wordsMismatch.append((sample_words[i], 3, sample_words[i]))

    return wordsMismatch


#code for analyzing teamim
def analyze_recordings(recording_1, recording_2, json_array_1, json_array_2):
    reviews = []

    audio = AudioSegment.from_file(io.BytesIO(recording_1))
    audio2 = AudioSegment.from_file(io.BytesIO(recording_2))

    for obj_1, obj_2 in zip(json_array_1, json_array_2):
        text_1, start_time_1, end_time_1 = obj_1['text'], obj_1['start'], obj_1['end']
        text_2, start_time_2, end_time_2 = obj_2['text'], obj_2['start'], obj_2['end']

        try:
            subclip = audio[float(start_time_1)* 1000:float(end_time_1)* 1000]
            subclip2 = audio2[float(start_time_2)* 1000:float(end_time_2)* 1000]

            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_wav_file:
                with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_wav_file2:

                    wav_io = io.BytesIO()
                    subclip.export(wav_io, format="wav")
                    wav_content = wav_io.getvalue()
                    temp_wav_file.write(wav_content)

                    wav_io = io.BytesIO()
                    subclip2.export(wav_io, format="wav")
                    wav_content = wav_io.getvalue()
                    temp_wav_file2.write(wav_content)

                    FILE_URL = temp_wav_file.name
                    FILE_URL2 = temp_wav_file2.name

                    similarity_rank = compare(FILE_URL, FILE_URL2)

                    # Determine review based on similarity rank
                    if similarity_rank < 110:
                        review = 'BAD'
                    else:
                        review = 'GOOD'

                    reviews.append({'text': text_1, 'start': start_time_1, 'end': end_time_1, 'review': review, 'score': similarity_rank})

        except Exception as e:
            print(e)
            print(f"Error analyzing segment '{text_1}': {e}")
            # reviews.append({'text': text_1, 'review': 'ERROR', 'error': str(e)})
            reviews.append({'text': text_1, 'review': 'ERROR'})
    return reviews


def trim_silence(audio_data, sr):
    yt, index = librosa.effects.trim(audio_data, top_db=10, frame_length=2048, hop_length=512)
    trimmed_start = librosa.frames_to_time([index[0]], sr=sr)
    return yt, trimmed_start

def load_and_trim_audio(file_path, sr=22050, top_db=20):
    audio_data, sr = librosa.load(file_path, sr=sr)
    audio_data_trimmed, trimmed_start = trim_silence(audio_data, sr)
    return audio_data_trimmed, sr, trimmed_start

def align_audios(ref_audio, attempt_audio):
    correlation = correlate(attempt_audio, ref_audio)
    lag = correlation.argmax() - (len(ref_audio) - 1)
    if lag > 0:
        aligned_attempt = attempt_audio[lag:]
        aligned_ref = ref_audio[:len(aligned_attempt)]
    else:
        aligned_ref = ref_audio[-lag:]
        aligned_attempt = attempt_audio[:len(aligned_ref)]
    min_len = min(len(aligned_ref), len(aligned_attempt))
    aligned_ref = aligned_ref[:min_len]
    aligned_attempt = aligned_attempt[:min_len]
    return aligned_ref, aligned_attempt

def normalize_audio(audio_data):
    max_amplitude = np.max(np.abs(audio_data))
    if max_amplitude > 0:
        return audio_data / max_amplitude
    return audio_data


def process_audio(file_path, sample_rate):
    audio_data, sr, _ = load_and_trim_audio(file_path, sr=sample_rate)
    audio_data = normalize_audio(audio_data)
    #audio_data = loudness_normalize_audio(audio_data, sr)
    return audio_data

def compute_mfcc(audio, sr, n_mfcc=13):
    mfcc = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=n_mfcc)
    return mfcc

def compare_mfcc_dtw(mfcc1, mfcc2):
    distance, path = fastdtw(mfcc1.T, mfcc2.T, dist=euclidean)
    return distance

def normalize_mfcc_dtw(mfcc_dtw_score, min_score=20285, max_score=36848):
    """Normalize the MFCC DTW similarity score to a range between 0 and 1."""
    return 1 - (mfcc_dtw_score - min_score) / (max_score - min_score)

def calculate_final_similarity(zcr_similarity, spectral_similarity, audio_similarity, mfcc_dtw_similarity):
    """Calculate the final similarity score based on the given metrics with adjusted weights."""
    normalized_mfcc_dtw = normalize_mfcc_dtw(mfcc_dtw_similarity)
    
    final_score = 100 * (
        0.2 * zcr_similarity +
        0.25 * spectral_similarity +
        0.25 * audio_similarity +
        0.3 * normalized_mfcc_dtw
    )
    
    return final_score

import tempfile
import soundfile as sf

def compare(original_path, compare_path):
    sample_rate = 44100

    try:
        # Process original and compare audio files
        original_audio = process_audio(original_path, sample_rate)
        compare_audio = process_audio(compare_path, sample_rate)

        # Align the compare audio to the original audio
        aligned_original_audio, aligned_compare_audio = align_audios(original_audio, compare_audio)

        # Create temporary files to hold the aligned audio data
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file1, \
             tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file2:
             
            # Write the aligned audios to the temporary files
            sf.write(temp_file1.name, aligned_original_audio, 48000, 'PCM_24')
            sf.write(temp_file2.name, aligned_compare_audio, 48000, 'PCM_24')

            # Weights for the similarity metrics
            weights = {
                'zcr_similarity': 0.4,
                'rhythm_similarity': 0.2,
                'chroma_similarity': 0.2,
                'energy_envelope_similarity': 0.1,
                'spectral_contrast_similarity': 0.1,
                'perceptual_similarity': 0.2
            }
            verbose = True  # Show logs
            sample_size = None  # Not used for single file comparison

            # Create an instance of the AudioSimilarity class with individual files
            audio_similarity = AudioSimilarity(temp_file1.name, temp_file2.name, sample_rate, weights, verbose=verbose)

            # Calculate a single metric
            zcr_similarity = audio_similarity.zcr_similarity()
            spectral_similarity = audio_similarity.spectral_contrast_similarity()
            similarity_score = audio_similarity.stent_weighted_audio_similarity()

            mfcc_goal = compute_mfcc(aligned_compare_audio, sample_rate)
            mfcc_student = compute_mfcc(aligned_original_audio, sample_rate)

            # Compute similarity using DTW on MFCCs
            mfcc_score = compare_mfcc_dtw(mfcc_goal, mfcc_student)
            similarity_rank = calculate_final_similarity(zcr_similarity, spectral_similarity, similarity_score, mfcc_score)
            print(f"Similarity Rank: {similarity_rank}")
            return similarity_rank

    except Exception as e:
        print(f"Error occurred during comparison: {e}")
        raise  # Re-raise the exception to propagate it upwards