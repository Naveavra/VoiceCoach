using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using System;
using UnityEngine.Networking;
using System.Runtime.InteropServices.WindowsRuntime;

public class Sample_script : MonoBehaviour
{

    public GameObject vis;
    private List<GameObject> visSampleArray = new List<GameObject>();

    public float minHeight;
    public float maxHeight;
    public float updateSentivity;


    public int visualizerSimples;

    public AudioSource audioSource;

    public AudioClip uploadedAudioClip; 
    public bool loop = true;

    public string path;
    public string audioType;



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

    private void addClipForSample()
    {
        audioSource.loop = loop;
        audioSource.clip = uploadedAudioClip;
        audioSource.Play();
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
        StartCoroutine(loadClip());
    }


    private IEnumerator loadClip()
    {
        audioSource.Stop();
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
        audioSource.clip = uploadedAudioClip;
        audioSource.Play();
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
