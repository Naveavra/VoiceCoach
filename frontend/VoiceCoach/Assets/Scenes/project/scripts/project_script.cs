using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;
using NAudio.Wave;

public class project_script : MonoBehaviour
{

    public GameObject vis;
    private List<GameObject> visRecordingArray = new List<GameObject>();
    //Not sure if needed:
    //private List<GameObject> visSampleArray = new List<GameObject>();

    public float minHeight;
    public float maxHeight;
    public float updateSentivity;
   
    
    public int visualizerSimples;

    public AudioSource audioSource;
    public AudioClip recordedAudioClip;
    private bool isRecording = false;


    void Start()
    {
        //values we need
        minHeight = 0.1f;
        maxHeight = 1.5f;
        updateSentivity = 0.5f;
        visualizerSimples = 1024;

        startVis();
        //addMicForRecording();

    }

    private void startVis()
    {
        float x = -2.7f;
        while (x <= 2.7f)
        {
            GameObject visClone = Instantiate(vis);
            visClone.transform.position = new Vector3(x, -0.3f, 1.0f);
            visRecordingArray.Add(visClone);
            x = x + 0.3f;
        }
    }


    public void startRecording()
    {
        if (!isRecording)
        {
            Debug.Log("Start Recording was invoked");
            recordedAudioClip = audioSource.clip = Microphone.Start(string.Empty, audioSource.loop, 15, 44100);
            audioSource.loop = true;
            //while (!(Microphone.GetPosition(null) > 0)) { }
            audioSource.Play();
            isRecording = true;
        }
    }


    public void stopRecording()
    {
        Debug.Log("Stop Recording was invoked");
        if (isRecording)
        {
            Microphone.End(null);
            isRecording = false;
            audioSource.clip = null; // Stop playing sound from the microphone
            string filePath = Application.persistentDataPath + "/recordedAudio.wav";
            AudioRecorder.SaveRecording(recordedAudioClip, filePath);
            Debug.Log("Recording saved to: " + filePath);
            isRecording = false;
        }
    }


    void FixedUpdate()
    {
        float[] spectrumData = audioSource.GetSpectrumData(visualizerSimples, 0, FFTWindow.Hanning);
        for (int i = 0; i < visRecordingArray.Count; i++)
        {
            float y = Mathf.Clamp(Mathf.Lerp(visRecordingArray[i].transform.localScale.y, minHeight + (spectrumData[i] * (maxHeight - minHeight) * 20.0f), updateSentivity * 0.5f), minHeight, maxHeight);
            visRecordingArray[i].transform.localScale = new Vector3(0.1f, y, 1.0f);
        }
    }
}
