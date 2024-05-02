using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Threading.Tasks;
using System.IO;
using Assets.Scenes.Classes;
using System;


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

    void Start()
    {

    }


    public void startAnalyze()
    {
    }

    public void endAnalyze()
    {
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

    private async void getWords()
    {
    }

    private async void getWordsUser()
    {
    }

}