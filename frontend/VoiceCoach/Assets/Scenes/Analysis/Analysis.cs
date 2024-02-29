using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using NAudio;
using System;
using UnityEngine.UI;
using UnityEngine.AdaptivePerformance.Provider;


public class Analysis : MonoBehaviour
{

    public AudioSource audioSource;
    public AudioClip audioClip;
    public AudioClip audioClipOG;
    public RawImage waveformImage;
    // Start is called before the first frame update
    void Start()
    {
        audioSource.loop = true;
        audioSource.clip = audioClip;
        float[] rawData = new float[audioClip.samples * audioClip.channels];
        audioClip.GetData(rawData, 0);
        Texture2D texture = plotAudioData(rawData);
        
        waveformImage.texture = texture;
        Debug.Log("hey");
        //audioSource.Play();
    }

    void etractAudioData(AudioClip ogClip)
    {
        float[] rawData = new float[ogClip.samples * ogClip.channels];
        ogClip.GetData(rawData, 0);

        // convert audio data to byre array
        short[] intData = new short[rawData.Length];
        byte[] bytes = new byte[rawData.Length * sizeof(short)];
        for (int i = 0; i < rawData.Length; i++) {
            intData[i] = (short)(rawData[i] * short.MaxValue);  
        }
        Buffer.BlockCopy(intData, 0, bytes, 0, bytes.Length);

    }

    Texture2D plotAudioData(float[] data)
    {
        // Create a new Texture2D
        int width = 1024; // Texture width
        int height = 256; // Texture height
        Texture2D texture = new Texture2D(width, height);

        // Clear the texture with a background color
        for (int x = 0; x < texture.width; x++)
        {
            for (int y = 0; y < texture.height; y++)
            {
                texture.SetPixel(x, y, Color.black); // or any background color
            }
        }

        // Plotting the waveform
        float amplify = 2.0f; // Multiplier to amplify the waveform
        int skip = data.Length / width;
        for (int x = 0; x < width; x++)
        {
            int dataIndex = x * skip;
            float sample = data[Mathf.Min(dataIndex, data.Length - 1)] * amplify; // Amplify the sample
            int yPosition = (int)(((sample + 1f) * 0.5f) * (height - 1));
            yPosition = Mathf.Clamp(yPosition, 0, height - 1); // Ensure yPosition stays within bounds
            texture.SetPixel(x, yPosition, Color.green);
        }

        texture.Apply(); // Apply changes to the texture
        return texture;

    }

    // Update is called once per frame
    void Update()
    {

    }


}
