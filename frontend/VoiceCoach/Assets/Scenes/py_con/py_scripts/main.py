import librosa
import pandas as pd
import matplotlib.pylab as plt
import numpy as np
import librosa.display
from fastdtw import fastdtw
from scipy.spatial.distance import euclidean
import parselmouth
import json

feedback_dict = {}


def createFeedbackDict():
    """Create and initialize the feedback dictionary"""
    feedback_dict["minorPitchDeviation"] = ("you're very close to hitting the notes perfectly!"
                                            " Paying a little extra attention to the finer details of each note's pitch can make your performance even more precise."
                                            " Try gently adjusting your pitch up or down as needed")
    feedback_dict["significantPitchDeviation"] = (
        "Try focusing on listening closely to each note before you play or sing it,"
        " and compare it to a reference pitch or use a tuner to guide you."
        " Practicing slow and mindful repetition of the sections where the pitch deviates can also be really helpful")
    feedback_dict[
        "longNoteDeviation"] = "you held the note longer than expected. Shortening it slightly will align better with the goal."
    feedback_dict[
        "shortNoteDeviation"] = "your note was shorter than expected. Extending its length will bring it closer to the intended expression"
    feedback_dict["highVowelDeviation"] = "Try to 'open' your mouth a bit less when pronouncing vowels, aiming for a slightly 'tighter' vowel sound."
    feedback_dict["lowVowelDeviation"] = "Try to 'open' your mouth a bit more for vowels, aiming for a 'fuller' sound."
    feedback_dict["perfectVowelDeviation"] = "Excellent! Your vowel sounds closely match the goal. Keep focusing on maintaining this clarity in your vowel pronunciation."

# def createThresholdsBasedOnLevel(level):
#     if level == "beginner":
#         #init threshold
#         return
#     if level == "medium":
#         #init threshold
#         return
#     if level == "expert":
#         #init threshold
#         return

def load_and_normalize_audio(filePath, trim_db=20):
    """Load an audio file, trim silence, and normalize."""
    y, sr = librosa.load(filePath)
    y_trimmed, _ = librosa.effects.trim(y, top_db=trim_db)
    y_normalized = y_trimmed / np.max(np.abs(y_trimmed))
    return y_normalized, sr


# def calculate_similarity(y1, y2):
#     """Calculate and print DTW distance and correlation peak."""
#     distance, _ = fastdtw(y1, y2, dist=euclidean)
#     correlation = np.correlate(y1, y2, mode='full')
#     print(f"DTW distance: {distance}")
#     print(f"Correlation peak: {max(correlation)}")


def extract_pitch(y, sr, fmin=50, fmax=2000):
    """
    Extract the pitch of an audio signal.

    Parameters:
    - y: Audio time series
    - sr: Sampling rate of y
    - fmin: Minimum frequency in analyzing audio signal
    - fmax: Maximum frequency in analyzing audio signal

    Returns:
    - pitches: Extracted pitch values
    - times: Time values corresponding to the pitches
    """
    pitches, magnitudes = librosa.piptrack(y=y, sr=sr, fmin=fmin, fmax=fmax)
    # Selecting the frequency with the highest magnitude
    pitch_values = np.max(pitches, axis=0)
    pitch_values = [pitch if mag > np.median(magnitudes) else 0 for pitch, mag in
                    zip(pitch_values, np.max(magnitudes, axis=0))]
    times = librosa.times_like(pitches, sr=sr)
    return pitch_values, times


def extract_rhythm(y, sr):
    """Extract rhythm and tempo from an audio signal."""
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    tempo, beats = librosa.beat.beat_track(onset_envelope=onset_env, sr=sr)
    times = librosa.times_like(onset_env, sr=sr)
    return tempo, beats, times, onset_env


def extract_note_durations_and_times(audio_file_path):
    """
    Extract note durations and start times from an audio file.

    Parameters:
    - audio_file_path: Path to the audio file.

    Returns:
    - durations: List of durations for each note.
    - times: List of start times for each note.
    - sr: Sampling rate of the audio file.
    """
    # Load the audio file
    y, sr = librosa.load(audio_file_path)

    # Detect onsets (note starts)
    onsets = librosa.onset.onset_detect(y=y, sr=sr, units='time')

    # Calculate durations between onsets as a proxy for note durations
    # This approach is simplistic and assumes each note's duration lasts until the next note's onset
    durations = np.diff(onsets, append=len(y) / sr)  # Append the file's end time to calculate the last note's duration

    return durations, onsets, sr


def extract_vowel_formants(audio_signal, sr, window_length=0.025, time_step=0.50):
    """
    Extract the first two formant frequencies (F1 and F2) of vowels over time from an audio signal.

    Parameters:
    - audio_signal: The audio signal from which to extract formants.
    - sr: The sampling rate of the audio signal.
    - window_length: The length of the analysis window in seconds.
    - time_step: The step between successive windows in seconds.

    Returns:
    - f1: The first formant frequency over time.
    - f2: The second formant frequency over time.
    - times: The time points at which formants were extracted.
    """
    # Convert the audio signal to a Parselmouth Sound object
    sound = parselmouth.Sound(values=audio_signal, sampling_frequency=sr)

    # Perform formant analysis
    formant = sound.to_formant_burg(time_step=time_step, window_length=window_length)

    # Define the time points at which to evaluate formants
    times = np.arange(formant.start_time, formant.end_time, time_step)

    # Extract formant frequencies at these time points for F1 and F2
    f1 = [formant.get_value_at_time(1, time) for time in times]
    f2 = [formant.get_value_at_time(2, time) for time in times]

    return times, f1, f2


# def calculate_similarity(y1, y2):
#     """Calculate and print the distance and correlation between two audio signals."""
#     distance, path = fastdtw(y1, y2)
#     print(f"DTW distance: {distance}")

#     correlation = np.correlate(y1, y2, mode='full')
#     print(f"Correlation peak: {max(correlation)}")


# def speechToText():
#     model = whisper.load_model('base')
#     result = model.transcribe('recording2.wav', fp16=False)
#     with open("text.txt", "a", encoding='utf-8') as f:
#         f.write(result['text'])
#     print(result['text'])


def frequency_to_note_name(frequencies, sr, threshold=0.5, sample_rate=10):
    """
    Convert frequencies to note names, applying a threshold to filter out less dominant notes
    and sampling to reduce the number of notes plotted.

    Parameters:
    - frequencies: Array of frequencies.
    - sr: Sampling rate.
    - threshold: Magnitude threshold to consider a frequency as a dominant note.
    - sample_rate: Interval at which to sample notes for plotting.

    Returns:
    - sampled_note_names: List of sampled note names.
    - sampled_times: Corresponding times for the sampled notes.
    """
    pitches, magnitudes = librosa.piptrack(sr=sr, S=librosa.stft(frequencies))
    times = librosa.times_like(magnitudes, sr=sr)
    note_names = []
    for t in range(pitches.shape[1]):
        index = magnitudes[:, t].argmax()
        mag = magnitudes[index, t]
        if mag > threshold:
            note = librosa.hz_to_note(pitches[index, t])
            note_names.append(note)
        else:
            note_names.append(None)

    # Sample the notes and their times to reduce overcrowding
    sampled_note_names = note_names[::sample_rate]
    sampled_times = times[::sample_rate]

    return sampled_note_names, sampled_times


def plot_combined_analysis(y1, y2, sr, title1='Goal', title2='Session', save_path='combined_analysis.png'):
    """
    Plot combined analysis (waveform, spectrogram, pitch, rhythm/tempo) for two audio signals.
    Each analysis type is displayed in its own row, with separate columns for each audio file.
    """
    plt.figure(figsize=(20, 24))  # Adjust figure size for better visibility

    # Define titles for subplots to enhance code readability
    analysis_titles = ['Waveform', 'Spectrogram', 'Pitch Track', 'Rhythm and Tempo']

    # Waveform Analysis
    plt.subplot(4, 2, 1)
    pd.Series(y1).plot(lw=1, title=f'{title1} - {analysis_titles[0]}', label='File 1')
    plt.legend()

    plt.subplot(4, 2, 2)
    pd.Series(y2).plot(lw=1, title=f'{title2} - {analysis_titles[0]}', label='File 2')
    plt.legend()

    # Spectrogram Analysis
    for i, (y, title) in enumerate(zip([y1, y2], [title1, title2]), 3):
        plt.subplot(4, 2, i)
        sampled_note_names, sampled_times = frequency_to_note_name(y, sr)

        # Convert note names to a numerical scale for plotting
        unique_notes = list(set(filter(None, sampled_note_names)))  # Remove None and get unique notes
        note_to_num = {note: i for i, note in enumerate(unique_notes)}

        # Plot each note at its corresponding time, using the note_to_num mapping
        for note, time in zip(sampled_note_names, sampled_times):
            if note is not None:
                plt.scatter(time, note_to_num[note], label=note, color='blue' if i == 3 else 'orange')

        plt.yticks(range(len(unique_notes)), unique_notes)  # Set y-ticks to the unique note names
        plt.title(f'{title} - Main Notes Over Time')
        plt.xlabel('Time (s)')

    # Pitch Track Analysis
    for i, y in enumerate([y1, y2], 5):
        plt.subplot(4, 2, i)
        pitch, times = extract_pitch(y, sr)
        plt.plot(times, pitch)
        plt.title(f'{["Audio File 1", "Audio File 2"][i - 5]} - {analysis_titles[2]}')
        plt.xlabel('Time (s)')
        plt.ylabel('Frequency (Hz)')

    # Rhythm/Tempo Analysis
    for i, y in enumerate([y1, y2], 7):
        plt.subplot(4, 2, i)
        tempo, beats, times, onset_env = extract_rhythm(y, sr)
        plt.plot(times, librosa.util.normalize(onset_env), label='Onset Strength')
        plt.vlines(times[beats], 0, 1, alpha=0.5, color='r', linestyle='--', label='Beats')
        plt.legend()
        plt.title(f'{["Audio File 1", "Audio File 2"][i - 7]} - {analysis_titles[3]} (Tempo: {tempo:.2f} BPM)')

    plt.tight_layout(pad=3.0)  # Adjust padding between and around subplots
    plt.subplots_adjust(hspace=0.5, wspace=0.3)  # Adjust space between rows (hspace) and columns (wspace)
    plt.savefig(save_path, dpi=300, bbox_inches='tight')  # Adjust 'dpi' and 'bbox_inches' as needed
    # plt.show()


def generate_rhythm_tempo_feedback(tempo1, beats1, tempo2, beats2, sr):
    """
    Generate feedback based on rhythm and tempo comparison between two audio signals.

    Parameters:
    - tempo1, beats1: Tempo and beats of the first audio signal (goal).
    - tempo2, beats2: Tempo and beats of the second audio signal (learner's attempt).
    - sr: Sampling rate.

    Returns:
    - feedback: A string containing specific feedback based on rhythm and tempo comparison.
    """
    feedback = ""

    if not np.isclose(tempo1, tempo2, atol=5):  # Allowing a tolerance of 5 BPM
        faster_or_slower = "faster" if tempo2 > tempo1 else "slower"
        feedback += f"Your overall tempo is {faster_or_slower} than the goal. "
        feedback += f"Aim for a tempo closer to {tempo1:.2f} BPM. "

        # Convert beat frames to time for both signals
    times1 = librosa.frames_to_time(beats1, sr=sr)
    times2 = librosa.frames_to_time(beats2, sr=sr)

    # Analyze beat alignment
    if times1.size and times2.size:
        # Find closest beat in times1 for each beat in times2 and calculate the time differences
        beat_differences = [min(abs(times1 - t2)) for t2 in times2]
        # Identify significant misalignments as those exceeding half the average beat interval (a simplistic approach)
        avg_beat_interval = np.mean(np.diff(times1))
        significant_misalignments = [t2 for diff, t2 in zip(beat_differences, times2) if diff > avg_beat_interval / 2]

        if significant_misalignments:
            misaligned_times = ', '.join(
                [f"{t:.2f}s" for t in significant_misalignments[:3]])  # Limiting to first 3 significant misalignments
            feedback += f"Check your beat timing around {misaligned_times}. You're occasionally off-beat. "

    return feedback if feedback else "Great job! Your rhythm and tempo closely match the goal."


def cluster_deviations(deviations, threshold=0.7):
    """
    Cluster deviations that are close in time.

    Parameters:
    - deviations: List of time points with deviations.
    - threshold: Time difference threshold to consider deviations as part of the same cluster.

    Returns:
    - clusters: List of clusters, where each cluster is a list of deviations close in time.
    """
    clusters = []
    current_cluster = []

    for time in sorted(deviations):
        if current_cluster and time - current_cluster[-1] > threshold:
            clusters.append(current_cluster)
            current_cluster = [time]
        else:
            current_cluster.append(time)
    if current_cluster:
        clusters.append(current_cluster)

    return clusters


def format_cluster_times(clusters):
    """
    Format clusters of deviations for feedback.

    Parameters:
    - clusters: List of clusters with deviation times.

    Returns:
    - formatted_times: String representation of clustered deviation times.
    """
    formatted_times = []
    for cluster in clusters:
        if len(cluster) > 1:
            formatted_times.append(f"{cluster[0]:.2f}s - {cluster[-1]:.2f}s")
        else:
            formatted_times.append(f"{cluster[0]:.2f}s")
    return ', '.join(formatted_times[:3])  # Limiting to first 3 clusters


def generate_pitch_feedback(pitch1, pitch2, times2):
    """
    Generate feedback based on pitch track comparison between two audio signals.

    Parameters:
    - pitch1, times1: Pitch values and corresponding times for the first audio signal (goal).
    - pitch2, times2: Pitch values and corresponding times for the second audio signal (learner's attempt).

    Returns:
    - feedback: A string containing specific feedback based on pitch track comparison.
    """
    feedback = ""

    # Simplified comparison for demonstration purposes
    # In practice, consider using more sophisticated methods like Dynamic Time Warping (DTW)
    # for detailed pitch contour comparison

    # Identify significant pitch deviations
    significantDeviations = [t2 for p1, p2, t2 in zip(pitch1, pitch2, times2) if
                             abs(p1 - p2) > 50]  # Arbitrary threshold
    minorDeviations = [t2 for p1, p2, t2 in zip(pitch1, pitch2, times2) if abs(p1 - p2) <= 50]
    significant_clusters = cluster_deviations(significantDeviations)
    minor_clusters = cluster_deviations(minorDeviations)
    if significant_clusters:
        deviation_times = format_cluster_times(significant_clusters)
        feedback += f"Around {deviation_times} your pitch deviates significantly from the goal.\n"
        feedback += feedback_dict["significantPitchDeviation"] + "\n"
    if minor_clusters:
        deviation_times = format_cluster_times(minor_clusters)
        feedback += f"Around {deviation_times} your pitch slightly deviates from the goal.\n"
        feedback += feedback_dict["minorPitchDeviation"] + "\n"
    return feedback if feedback else "Excellent pitch matching throughout the piece!"


def generate_duration_feedback(durations1, durations2, times, sr, threshold=0.2):
    """
    Generate feedback based on the duration comparison between two audio signals.

    Parameters:
    - durations1: Durations of notes or words in the first audio signal (goal).
    - durations2: Durations of notes or words in the second audio signal (learner's attempt).
    - times: Time points corresponding to the start of each note or word.
    - sr: Sampling rate.
    - threshold: Tolerance threshold for considering a duration mismatch significant.

    Returns:
    - feedback: A string containing specific feedback based on duration comparison.
    """
    feedback = ""

    # Identify mismatches in duration where learner's attempt significantly differs from the goal
    duration_differences = [(d1 - d2, t) for d1, d2, t in zip(durations1, durations2, times)]

    # Identify significant mismatches with their direction (positive for too long, negative for too short)
    significant_mismatches = [(diff, t) for diff, t in duration_differences if abs(diff) > threshold]

    if significant_mismatches:
        feedback += "Let's focus on refining the lengths of some notes or words:\n"
        for diff, t in significant_mismatches[:3]:  # Limit to first 3 mismatches for brevity
            if diff > 0:
                feedback += f"- At {t:.2f}s,"
                feedback += feedback_dict["longNoteDeviation"] + "\n"
            else:
                feedback += f"- At {t:.2f}s,"
                feedback += feedback_dict["shortNoteDeviation"] + ".\n"

    # Assuming fewer significant mismatches indicate minor issues
    if len(significant_mismatches) < 3:
        feedback += "You're close to matching the goal's durations. Focusing on the subtle timing differences will bring further refinement to your performance or speech.\n"

    return feedback if feedback else "Excellent! Your timing and duration closely match the goal."


def generate_vowel_feedback(f1_goal, f2_goal, f1_session, f2_session,times, threshold=50):
    """
    Generate feedback based on the vowel formant frequency comparison between two audio signals.

    Parameters:
    - f1_goal, f2_goal: Lists of the first and second formant frequencies for the goal audio signal.
    - f1_session, f2_session: Lists of the first and second formant frequencies for the learner's attempt.
    - threshold: Tolerance threshold in Hz for considering a formant frequency mismatch significant.

    Returns:
    - feedback: A string containing specific feedback based on vowel formant frequency comparison.
    """
    feedback = []
    # Ensure the iteration is within the bounds of all lists
    min_length = min(len(f1_goal), len(f2_goal), len(f1_session), len(f2_session))
    
    # It's also important to ensure 'times' list matches the lengths of formant lists
    times = times[:min_length]
    for i, time in enumerate(times):
        diff_f1 = f1_session[i] - f1_goal[i]
        diff_f2 = f2_session[i] - f2_goal[i]

        if abs(diff_f1) > threshold or abs(diff_f2) > threshold:
            if abs(diff_f1) > threshold:
                action = "open your mouth more" if diff_f1 > 0 else "raise your tongue or close your mouth more"
                feedback.append(f"At {time:.2f}s: Your F1 suggests you should {action}.")
            if abs(diff_f2) > threshold:
                action = "move your tongue forward" if diff_f2 > 0 else "move your tongue back"
                feedback.append(f"At {time:.2f}s: Your F2 suggests you should {action}.")
                
    if not feedback:
        feedback = ["Your vowel pronunciation closely matches the goal. Great job!"]

    return " ".join(feedback)


def analyze_and_compare(file1, file2):
    """Analyze and compare two audio files."""
    createFeedbackDict()
    y1, sr1 = load_and_normalize_audio(file1)
    y2, sr2 = load_and_normalize_audio(file2)
    assert sr1 == sr2, "Sample rates do not match!"
    tempo1, beats1, _, _ = extract_rhythm(y1, sr1)
    tempo2, beats2, _, _ = extract_rhythm(y2, sr2)

    # Generate and print rhythm/tempo feedback
    rhythm_tempo_feedback = generate_rhythm_tempo_feedback(tempo1, beats1, tempo2, beats2, sr1)
    #print(rhythm_tempo_feedback)
    

    # Generate and print pitch track feedback
    pitch1, times1 = extract_pitch(y1, sr1)
    pitch2, _ = extract_pitch(y2, sr2)
    pitch_feedback = generate_pitch_feedback(pitch1, pitch2, times1)
    #print(pitch_feedback)

    # Generate words and notes duration feedback
    durations1, times1, sr1 = extract_note_durations_and_times(file1)
    durations2, _, sr2 = extract_note_durations_and_times(file2)
    duration_feedback = generate_duration_feedback(durations1, durations2, times1, sr1)
    #print(duration_feedback)

    # Generate vowel formants feedback
    times, f1Goal, f2Goal = extract_vowel_formants(y1, sr1)
    times, f1Session, f2Session = extract_vowel_formants(y2, sr2)
    vowel_feedback = generate_vowel_feedback(f1Goal, f2Goal, f1Session, f2Session, times)
    #print(vowel_feedback)
    file_path = "Assets/Scenes/py_con/files/feedback.txt"
    finalized_feedback = ""
    finalized_feedback += rhythm_tempo_feedback + pitch_feedback + duration_feedback + vowel_feedback
    with open(file_path, 'w') as file:
        file.write(finalized_feedback)
    #plot_combined_analysis(y1, y2, sr1, title1=file1, title2=file2)
    

# Assuming y1, y2, sr1, sr2 are already defined, and load_and_normalize_audio function is used
# Example:

def main():
    json_file_path = "Assets/Scenes/py_con/recordings/path.txt"
    with open(json_file_path, 'r') as file:
        data = json.load(file)
    file1 = data['goal_path']
    file2 = data['session_path']
    analyze_and_compare(file1, file2)

main()
