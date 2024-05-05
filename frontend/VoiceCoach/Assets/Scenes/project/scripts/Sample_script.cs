using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using System;
using UnityEngine.Networking;
//using UnityEditor.Scripting.Python;
using System.Threading.Tasks;
using System.IO;

public class Sample_script : MonoBehaviour
{

    public GameObject vis;
    private List<GameObject> visSampleArray = new List<GameObject>();

    public float minHeight;
    public float maxHeight;
    public float updateSentivity;


    public int visualizerSimples;

    public AudioSource audioSource;

    private AudioClip uploadedAudioClip; 
    public bool loop = false;

    private string path;
    private string audioType;
    private string samplePath = "Assets/Scenes/project/recordings/sample.wav";
    private string py_words_path = "Assets/Scenes/project/py_scripts/get_words.py";
    private float counter = 0.0f;

    private string argumentsPath = "Assets/Scenes/project/py_scripts/arguments.json";

    private SampleData data;

    [System.Serializable]
    public class SampleData
    {
        public float offset;
        public float duration;
        public string line;
        public string oldLine;
        public List<string> syllables;

    }



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
            visClone.transform.position = new Vector3(x, 2.5f, 1.0f);
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
        path = EditorUtility.OpenFilePanel("select voice recording", "", "");

        audioType = path.Split('.')[path.Split('.').Length - 1];
        if (!String.Equals(audioType, "wav") && !String.Equals(audioType, "mp3"))
        {
            Debug.Log(audioType);
            return; // add here line to inform the user the recording given isn't compatible
        }
        Debug.Log("start loading");
        // StartCoroutine(loadClip());
        // Debug.Log(uploadedAudioClip);
        // Backend_API.instance.uploadSample(uploadedAudioClip,(res)=>{
        //     Debug.Log(res.text);
        // }); // add the project name
        // loadWords();
         StartCoroutine(loadClip(() =>
        {
        Debug.Log(uploadedAudioClip);
        Backend_API.instance.uploadSample(uploadedAudioClip,(res)=>{
            Debug.Log(res.text);
        }); // add the project name
        loadWords();
    }));
        //InvokeRepeating(nameof(loadWords), 0.0f, 10.0f);
    }


    private IEnumerator loadClip(Action onComplete)
    {
        Debug.Log("enter loading");
        audioSource.Stop();
        if (String.Equals(audioType, "mp3"))
        {
            UnityWebRequest webRequest = UnityWebRequest.Get(path);
            yield return webRequest.SendWebRequest();
            Debug.Log("sending mp3");
            if (webRequest.result == UnityWebRequest.Result.Success)
            {
                uploadedAudioClip = NAudioPlayer.FromMp3Data(webRequest.downloadHandler.data);
                Debug.Log("Loadclip");
                Debug.Log(uploadedAudioClip);
            }
            else
                UnityEngine.Debug.Log("Error: " + webRequest.error);
        }
        else
        {
            UnityWebRequest webRequest = UnityWebRequestMultimedia.GetAudioClip(path, AudioType.WAV);
            Debug.Log("sending wav");
            yield return webRequest.SendWebRequest();
            if (webRequest.result == UnityWebRequest.Result.Success)
            {
                Debug.Log("setting wav");
                uploadedAudioClip = DownloadHandlerAudioClip.GetContent(webRequest);
                Debug.Log("131");
                Debug.Log(uploadedAudioClip);
            }
            else
                Debug.Log("Error: " + webRequest.error);
        }
        AudioRecorder.SaveRecording(uploadedAudioClip, samplePath);
        audioSource.clip = uploadedAudioClip;
        onComplete?.Invoke();
        //audioSource.Play(); only play when recording starts
    }

    private async void loadWords()
    {

        data = new SampleData()
        {
            offset = 0,
            duration = 30,
            line = "",
            oldLine = "oldWords",
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
        Debug.Log("finished json");

        while(counter <= uploadedAudioClip.length)

        await Task.Run(() =>
        {
            //PythonRunner.RunFile(py_words_path);
        });
        Debug.Log("done");
        counter += data.duration;
        Debug.Log(uploadedAudioClip.length + " " + counter);
        string jsonText = File.ReadAllText(argumentsPath);

        // Deserialize the JSON string into a SampleData object
        data = JsonUtility.FromJson<SampleData>(jsonText);

        Debug.Log($"line: {data.line}");
        Debug.Log($"Syllables: {data.syllables[0]}");
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
}
