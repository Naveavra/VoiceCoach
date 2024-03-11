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
        if (!isRecording)
        {
            Debug.Log("Start Recording was invoked");
            recordedAudioClip = audioSource.clip = Microphone.Start(string.Empty, audioSource.loop, 300, 44100);
            audioSource.loop = true;
            while (!(Microphone.GetPosition(null) > 0)) { }
            audioSource.Play();
            isRecording = true;
        }
    }

    private AudioClip TrimSilence(AudioClip clip)
    {
        float[] samples = new float[clip.samples];
        clip.GetData(samples, 0);

        // Trim silence from the beginning
        int startSample = 0;
        while (Mathf.Approximately(samples[startSample], 0f) && startSample < samples.Length)
        {
            startSample++;
        }

        // Trim silence from the end
        int endSample = samples.Length - 1;
        while (Mathf.Approximately(samples[endSample], 0f) && endSample > 0)
        {
            endSample--;
        }

        // Create a new AudioClip with trimmed data
        float[] trimmedSamples = new float[endSample - startSample + 1];
        System.Array.Copy(samples, startSample, trimmedSamples, 0, trimmedSamples.Length);

        AudioClip trimmedClip = AudioClip.Create("TrimmedClip", trimmedSamples.Length, 1, clip.frequency, false);
        trimmedClip.SetData(trimmedSamples, 0);

        return trimmedClip;
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
            AudioRecorder.SaveRecording(TrimSilence(recordedAudioClip), filePath);
            Debug.Log("Recording saved to: " + filePath);
            isRecording = false;
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
