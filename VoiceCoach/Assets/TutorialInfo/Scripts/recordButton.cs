using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;
using UnityEngine;

public class recordButton : MonoBehaviour
{

    public int type = 0;
    public AudioSource audioSource;
    public pitchEstimator estimator;
    public float estimateRate = 30;

    List<string> notes = new List<string>();
    // Start is called before the first frame update
    void OnMouseDown()
    {
        if (type == 0)
        {
            type = 1;
            InvokeRepeating(nameof(printPitch), 0, 1.0f / estimateRate);
        }
        else
        {
            CancelInvoke();
            type = 0;
            string result = "List contents: ";
            foreach (var item in notes)
            {
                result += item.ToString() + ", ";
            }
            UnityEngine.Debug.Log(result);

            notes.Clear();
        }

    }

    //the note predict method
    void printPitch()
    {
        var frequency = estimator.Estimate(audioSource);
        if (!float.IsNaN(frequency))
        {
            string note = GetNameFromFrequency(frequency);
            UnityEngine.Debug.Log(note);
            notes.Add(note);
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
