using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using System;
using UnityEngine.Networking;
using System.Threading.Tasks;
using System.IO;
using Assets.Scenes.project.data;
using System.Diagnostics;
using AnotherFileBrowser.Windows;
using TMPro;

public class Sample_script : MonoBehaviour
{

    public GameObject vis;
    private List<GameObject> visSampleArray = new List<GameObject>();

    public float minHeight;
    public float maxHeight;
    public float updateSentivity;
    public TMP_Text wait_txt;


    public int visualizerSimples;

    public AudioSource audioSource;

    private AudioClip uploadedAudioClip; 
    public bool loop = false;

    private string path;
    private string audioType;
    private string samplePath = "Assets/Scenes/project/recordings/sample.wav";
    private string py_words_path = "Assets/Scenes/project/py_scripts/get_words.py";

    private string argumentsPath = "Assets/Scenes/project/py_scripts/arguments.json";

    private SampleData data;



    // Start is called before the first frame update
    void Start()
    {
        //values we need
        minHeight = 0.1f;
        maxHeight = 1.5f;
        updateSentivity = 0.5f;
        visualizerSimples = 1024;

        startVis();
        //addClipForSample();

    }

    private void startVis()
    {
        float x = -2.7f;
        while (x <= 2.7f)
        {
            GameObject visClone = Instantiate(vis);
            visClone.transform.position = new Vector3(x, 3.43f, 1.0f);
            visSampleArray.Add(visClone);
            x = x + 0.3f;
        }
    }
    private bool hasRecording()
    {
        return uploadedAudioClip != null;
    }


    public void accessFileExplorer()
    {
        //path = EditorUtility.OpenFilePanel("select voice recording", "", "");
        var bp = new BrowserProperties();
        bp.filter = "";
        bp.filterIndex = 0;

        new FileBrowser().OpenFileBrowser(bp, filePath =>
        {
            path = filePath;
            UnityEngine.Debug.Log(path);
            audioType = path.Split('.')[path.Split('.').Length - 1];
            if (!String.Equals(audioType, "wav") && !String.Equals(audioType, "mp3"))
            {
                UnityEngine.Debug.Log(audioType);
                return; // add here line to inform the user the recording given isn't compatible
            }
            else
            {
                
                StartCoroutine(loadClip());
                loadWords();
            }
        });
        //InvokeRepeating(nameof(loadWords), 0.0f, 10.0f);
    }


    private IEnumerator loadClip()
    {
        audioSource.Stop();
        audioSource.clip = null;
        if (String.Equals(audioType, "mp3"))
        {
            UnityWebRequest webRequest = UnityWebRequest.Get(path);
            yield return webRequest.SendWebRequest();
            if (webRequest.result == UnityWebRequest.Result.Success)
            {
                uploadedAudioClip = NAudioPlayer.FromMp3Data(webRequest.downloadHandler.data);
            }
            else
                UnityEngine.Debug.Log("Error: " + webRequest.error);
        }
        else
        {
            UnityWebRequest webRequest = UnityWebRequestMultimedia.GetAudioClip(path, AudioType.WAV);
            yield return webRequest.SendWebRequest();
            if (webRequest.result == UnityWebRequest.Result.Success)
            {
                uploadedAudioClip = DownloadHandlerAudioClip.GetContent(webRequest);
            }
            else
                UnityEngine.Debug.Log("Error: " + webRequest.error);
        }
        AudioRecorder.SaveRecording(samplePath, uploadedAudioClip);
        //audioSource.Play(); only play when recording starts
    }

    private async void loadWords()
    {

        data = new SampleData()
        {
            path = samplePath,
            offset = 0,
            duration = 20,
            lines = new List<string>(),
            syllables = new List<string>()
        };
        try
        {
            // Convert the object to a JSON string
            string jsonData = JsonUtility.ToJson(data, true);

            // Write the JSON string to the file
            File.WriteAllText(argumentsPath, jsonData);
        }
        catch (System.Exception ex)
        {
        }
        UnityEngine.Debug.Log("finished json");

        await Task.Run(() =>
        {
            runPython(py_words_path);
            //PythonRunner.RunFile(py_words_path);
        });
        UnityEngine.Debug.Log("done");
        wait_txt.text = "done";
        audioSource.clip = uploadedAudioClip;
    }


    void FixedUpdate()
    {
        float[] spectrumData = audioSource.GetSpectrumData(visualizerSimples, 0, FFTWindow.Hanning);
        for (int i = 0; i < visSampleArray.Count; i++)
        {
            float y = Mathf.Clamp(Mathf.Lerp(visSampleArray[i].transform.localScale.y, minHeight + (spectrumData[i] * (maxHeight - minHeight) * 50.0f), updateSentivity * 0.5f), minHeight, maxHeight);
            visSampleArray[i].transform.localScale = new Vector3(0.1f, y, 1.0f);
        }
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
