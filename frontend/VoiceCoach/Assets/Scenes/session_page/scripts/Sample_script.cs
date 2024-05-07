using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;
using UnityEngine.Networking;
using System.IO;
using Assets.Scenes.Classes;

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
    private float counter = 0.0f;

    private AnalysisData data;

    private string[] audioFileTypes;



    // Start is called before the first frame update
    void Start()
    {
        //values we need
        minHeight = 0.1f;
        maxHeight = 1.5f;
        updateSentivity = 0.5f;
        visualizerSimples = 1024;

        // Set up audio file types based on platform
#if UNITY_ANDROID
        // Use MIME types on Android
        audioFileTypes = new string[] { "audio/wav", "audio/mpeg" };
#elif UNITY_IOS
        // Use UTIs on iOS
        audioFileTypes = new string[] { "com.microsoft.waveform-audio", "public.mp3" };
#else
        // Use file extensions on Windows
        audioFileTypes = new string[] { ".wav", ".mp3" };
#endif
        startVis();

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
        // Don't attempt to pick a file if the file picker is already open
        if (NativeFilePicker.IsFilePickerBusy())
            return;

        NativeFilePicker.Permission permission = NativeFilePicker.PickFile((filePath) =>
        {
            if (filePath == null)
                Debug.Log("Operation cancelled");
            else
            {
                Debug.Log("Picked voice recording: " + filePath);
                audioType = filePath.Split('.')[1];
                path = filePath;
                StartCoroutine(loadClip());
            }
        }, null);

        Debug.Log("Permission result: " + permission);
    }


    private IEnumerator loadClip()
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
        else if (String.Equals(audioType, "wav"))
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
        else {
            Debug.Log("file type is not supported");
        }
        audioSource.clip = uploadedAudioClip;
        Backend_API.instance.AddSampleToProject(uploadedAudioClip);
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
