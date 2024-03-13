using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
//using UnityEditor.Scripting.Python;
using System.Threading.Tasks;
using System.IO;
using Assets.Scenes.project.data;
using System;
using System.Diagnostics;
using Assets.Scenes.project.python;


public class AnalyzeScript : MonoBehaviour
{
    public AudioSource userAudioSource;
    public AudioSource sampleAudioSource;
    public PitchEstimator estimator;
    public float estimateRate = 30.0f;
    public TMP_Text feedbackTxt;
    public List<string> userNotes = new List<string>();
    public List<string> sampleNotes = new List<string>();
    private int countIntervals = 0;
    public TMP_Text line_txt;
    public TMP_Text user_line_txt;
    private float user_line_dur = 20;
    private float user_offset = 0;


    private string argumentsPath = "Assets/Scenes/project/py_scripts/arguments.json";
    private string userArgumentsPath = "Assets/Scenes/project/py_scripts/user_arguments.json";
    private string py_words_path = "Assets/Scenes/project/py_scripts/get_words.py";
    private string user_py_words_path = "Assets/Scenes/project/py_scripts/user_get_words.py";
    private string user_path = "Assets/Scenes/project/recordings/recordedAudio.wav";

    private PythonManager py_manager = new PythonManager();

    void Start()
    {
        py_manager.StartPythonProcess();
    }


    public void startAnalyze()
    {
        if (userAudioSource.clip != null)
        {
            SampleData userData = new SampleData()
            {
                path = user_path,
                offset = user_offset,
                duration = user_line_dur,
                lines = new List<string>(),
                syllables = new List<string>()
            };
            try
            {
                // Convert the object to a JSON string
                string jsonData = JsonUtility.ToJson(userData, true);

                // Write the JSON string to the file
                File.WriteAllText(userArgumentsPath, jsonData);
            }
            catch (System.Exception ex)
            {
            }
            InvokeRepeating(nameof(printPitch), 0, 1.0f / estimateRate);
            InvokeRepeating(nameof(getWordsUser), user_line_dur, user_line_dur);
        }
        else
        {
            UnityEngine.Debug.Log("the user clip is not ready for use");
        }

        if(sampleAudioSource.clip != null)
        {
            getWords();
        }
        else
        {
            UnityEngine.Debug.Log("the sample clip is not ready for use");
        }
    }

    public void endAnalyze()
    {
        CancelInvoke();
    }

    void printPitch()
    {
        //user notes
        var frequency = estimator.Estimate(userAudioSource);
        if (!float.IsNaN(frequency))
        {
            string note = GetNameFromFrequency(frequency);
            feedbackTxt.text = note;
            userNotes.Add(note);
        }
        else
        {
            feedbackTxt.text = "";
        }

        //sample notes
        frequency = estimator.Estimate(sampleAudioSource);
        if (!float.IsNaN(frequency))
        {
            string note = GetNameFromFrequency(frequency);
            sampleNotes.Add(note);
        }
    }
    string GetNameFromFrequency(float frequency)
    {
        var noteNumber = Mathf.RoundToInt(12 * Mathf.Log(frequency / 440) / Mathf.Log(2) + 69);
        string[] names = {
            "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
        };
        return names[noteNumber % 12];
    }

    private AudioClip MakeSubclip(AudioClip clip, float start, float stop)
    {
        /* Create a new audio clip */
        int frequency = clip.frequency;
        float timeLength = (stop - start) * clip.channels;
        int samplesLength = (int)(frequency * timeLength);
        AudioClip newClip = AudioClip.Create(clip.name + "-sub", samplesLength, 1, frequency, false);

        /* Create a temporary buffer for the samples */
        float[] data = new float[samplesLength];
        /* Get the data from the original clip */
        clip.GetData(data, (int)(frequency * start));
        /* Transfer the data to the new clip */
        newClip.SetData(data, 0);

        /* Return the sub clip */
        return newClip;
    }

    private async void getWords()
    {

        string jsonText = File.ReadAllText(argumentsPath);
        // Deserialize the JSON string into a SampleData object
        SampleData data = JsonUtility.FromJson<SampleData>(jsonText);

        line_txt.text = data.lines[0];
        float sampleLength = sampleAudioSource.clip.length;
        while (data.offset < sampleLength)
        {
            UnityEngine.Debug.Log(data.offset + " " + sampleLength);
            await Task.Run(() =>
            {
                //py_manager.RunPythonScriptFile(py_words_path);
                //py_manager.RunIronPythonScript(py_words_path);
                runPython(py_words_path);
                //PythonRunner.RunFile(py_words_path);
            });

            jsonText = File.ReadAllText(argumentsPath);
            data = JsonUtility.FromJson<SampleData>(jsonText);
        }

    }

    private async void getWordsUser()
    {
        string jsonText = File.ReadAllText(argumentsPath);
        // Deserialize the JSON string into a SampleData object
        SampleData data = JsonUtility.FromJson<SampleData>(jsonText);

        line_txt.text = data.lines[(int)Math.Floor(user_offset / 20)+1];

        AudioRecorder.SaveRecording(user_path, AudioRecorder.TrimSilenceEnds(MakeSubclip(userAudioSource.clip, 0, user_offset+user_line_dur+5)));
        await Task.Run(() =>
        {
            //py_manager.RunPythonScriptFile(user_py_words_path);
            runPython(user_py_words_path);
            //PythonRunner.RunFile(user_py_words_path);
        });
        jsonText = File.ReadAllText(userArgumentsPath);
        // Deserialize the JSON string into a SampleData object
        data = JsonUtility.FromJson<SampleData>(jsonText);
        user_offset = data.offset;
        user_line_txt.text = data.lines[data.lines.Count - 1];
    }

    private void runPython(string path)
    {
        string pythonExe = "Library/PythonInstall/python.exe";  // Modify if Python is not in your system PATH

        ProcessStartInfo start = new ProcessStartInfo
        {
            FileName = pythonExe,
            Arguments = path,
            RedirectStandardOutput = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };
        using (Process process = Process.Start(start))
        {
            process.WaitForExit();

        }
    }

}
