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
    public AudioSource sampleSource;
    public AudioClip recordedAudioClip;
    private bool isRecording = false;


    void Start()
    {
        //values we need
        minHeight = 0.1f;
        maxHeight = 1.5f;
        updateSentivity = 0.1f;
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
        if (!isRecording && sampleSource.clip != null)
        {
            Debug.Log("Start Recording was invoked");
            recordedAudioClip = audioSource.clip = Microphone.Start(string.Empty, audioSource.loop, 300, 44100);
            audioSource.loop = true;
            while (!(Microphone.GetPosition(null) > 0)) { }
            audioSource.Play();
            isRecording = true;
        }
        else
        {
            Debug.Log("needs to wait for sample");
        }
    }


    public void stopRecording()
    {
        if (isRecording)
        {
            Debug.Log("Stop Recording was invoked");
            Microphone.End(null);
            isRecording = false;
            audioSource.clip = null; // Stop playing sound from the microphone
            string filePath = "Assets/Scenes/project/recordings/recordedAudio.wav";
            AudioRecorder.SaveRecording(filePath, AudioRecorder.TrimSilenceEnds(recordedAudioClip));
            Debug.Log("Recording saved to: " + filePath);
            isRecording = false;
        }
        else
        {
            Debug.Log("already recording");
        }
    }


    void FixedUpdate()
    {
        float[] spectrumData = audioSource.GetSpectrumData(visualizerSimples, 0, FFTWindow.Hanning);
        //smoothing
        var nyquistFreq = AudioSettings.outputSampleRate / 2.0f;
        for (int i = 0; i < visualizerSimples; i++)
        {
            spectrumData[i] = Mathf.Log(spectrumData[i] + 1e-9f);
        }

        float[] specCum = new float[visualizerSimples];
        specCum[0] = 0;
        for (int i = 1; i < visualizerSimples; i++)
        {
            specCum[i] = specCum[i - 1] + spectrumData[i];
        }

        float smoothingWidth = 500;

        var halfRange = Mathf.RoundToInt((smoothingWidth / 2) / nyquistFreq * visualizerSimples);
        for (int i = 0; i < visualizerSimples; i++)
        {
            var indexUpper = Mathf.Min(i + halfRange, visualizerSimples - 1);
            var indexLower = Mathf.Max(i - halfRange + 1, 0);
            var upper = specCum[indexUpper];
            var lower = specCum[indexLower];
            var smoothed = (upper - lower) / (indexUpper - indexLower);

            spectrumData[i] = spectrumData[i] - smoothed;
        }

        //visualizing
        for (int i = 0; i < visRecordingArray.Count; i++)
        {
            float y = Mathf.Clamp(Mathf.Lerp(visRecordingArray[i].transform.localScale.y, minHeight + (spectrumData[i+1] * (maxHeight - minHeight) * 0.5f), updateSentivity * 0.5f), minHeight, maxHeight);
            visRecordingArray[i].transform.localScale = new Vector3(0.1f, y, 1.0f);
        }
    }
}
