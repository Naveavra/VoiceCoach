using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using UnityEngine;

public class AudioInput : MonoBehaviour
{
    //the audio source
    public AudioSource audioSource;
    public int duration = 8;


    // Start is called before the first frame update
    void Start()
    {
        //sanity
        if (Microphone.devices.Length > 0)
        {
            //setting microphone as audio clip
            audioSource.clip = Microphone.Start(string.Empty, audioSource.loop, duration, AudioSettings.outputSampleRate);
        }

        audioSource.Play();

    }
}