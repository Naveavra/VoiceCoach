using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;

public class project_script : MonoBehaviour
{

    public GameObject vis;
    private List<GameObject> visArray = new List<GameObject>();

    public float minHeight;
    public float maxHeight;
    public float updateSentivity;
   
    
    public int visualizerSimples;

    public AudioSource audioSource;
    public int duration;

    public AudioClip audioClip;
    public bool loop = true;

    void Start()
    {
        //values we need
        minHeight = 0.1f;
        maxHeight = 1.5f;
        updateSentivity = 0.5f;
        visualizerSimples = 1024;
        duration = 3;


        float x = -2.7f;
        while(x <= 2.7f)
        {
            GameObject visClone = Instantiate(vis);
            visClone.transform.position = new Vector3(x, -0.3f, 1.0f);
            visArray.Add(visClone);
            x = x + 0.3f;
        }

        foreach (var device in Microphone.devices)
        {

            Debug.Log("Name: " + device);
        }

        audioSource.clip = Microphone.Start(string.Empty, audioSource.loop, 10, 44100);
        audioSource.loop = true;
        while(!(Microphone.GetPosition(null) > 0)) {}
        //audioSource.loop = loop;
        //audioSource.clip = audioClip;

        audioSource.Play();

    }

    void FixedUpdate()
    {
        if (audioSource.isPlaying)
        {
            float[] spectrumData = audioSource.GetSpectrumData(visualizerSimples, 0, FFTWindow.Hanning);
            for (int i = 0; i < visArray.Count; i++)
            {
                float y = Mathf.Clamp(Mathf.Lerp(visArray[i].transform.localScale.y, minHeight + (spectrumData[i] * (maxHeight - minHeight) * 20.0f), updateSentivity * 0.5f), minHeight, maxHeight);
                visArray[i].transform.localScale = new Vector3(0.1f, y, 1.0f);
            }
        }
        else
        {
            for (int i = 0; i < visArray.Count; i++)
            {
                visArray[i].transform.localScale = new Vector3(0.1f, 0.1f, 1.0f);
            }
        }
    }
}
