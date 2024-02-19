using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class ShowNote : MonoBehaviour
{
    public AudioSource audioSource;
    public PitchEstimator estimator;
    public float estimateRate = 30.0f;
    public TMP_Text noteTxt;


    // Start is called before the first frame update
    void Start()
    {
        InvokeRepeating(nameof(printPitch), 0, 1.0f / estimateRate);
    }

    void printPitch()
    {
        var frequency = estimator.Estimate(audioSource);
        if (!float.IsNaN(frequency))
        {
            string note = GetNameFromFrequency(frequency);
            noteTxt.text = note;
        }
        else
        {
            noteTxt.text = "";
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
}
