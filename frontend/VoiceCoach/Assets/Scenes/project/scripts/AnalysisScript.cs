using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

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


    public void startAnalyze()
    {
        InvokeRepeating(nameof(printPitch), 0, 1.0f / estimateRate);
        InvokeRepeating(nameof(analyze), 3.0f, 3.0f);
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

    void analyze()
    {
        //TODO: check if the number for comparison is ok
        if(userNotes.Count > sampleNotes.Count+(userNotes.Count/5)) 
        { 

        }
        //using this to detect syllables, tempo and strength
        if (countIntervals * 3 + 3 < sampleAudioSource.clip.length)
        {
            AudioClip userSubClip = MakeSubclip(userAudioSource.clip, countIntervals * 3 + 1, countIntervals * 3 + 4);
            Debug.Log("saved");
            AudioClip sampleSubClip = MakeSubclip(sampleAudioSource.clip, countIntervals * 3, countIntervals * 3 + 3);
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

}
