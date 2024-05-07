using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System;
using UnityEngine.Networking;
using System.IO;
using Assets.Scenes.Classes;
using TMPro;


public class project_page_script : MonoBehaviour
{

    public AudioSource audioSource;
    private string path;
    private string audioType;

    public TMP_Text notification;

    private AudioClip uploadedAudioClip;
    private string[] audioFileTypes;
    // Start is called before the first frame update
    void Start()
    {

        // Set up audio file types based on platform
#if UNITY_ANDROID
        // Use MIME types on Android
        audioFileTypes = new string[] { "audio/wav", "audio/mpeg" };
#elif UNITY_IOS
        // Use UTIs on iOS
        audioFileTypes = new string[] { "com.microsoft.waveform-audio", "public.mp3" };
#else
        // Use file extensions on Windows
        audioFileTypes = new string[] { ".wav", ".mp3" };
#endif

    }

    public void accessFileExplorer()
    {
        // Don't attempt to pick a file if the file picker is already open
        if (NativeFilePicker.IsFilePickerBusy())
            return;

        NativeFilePicker.Permission permission = NativeFilePicker.PickFile((filePath) =>
        {
            if (filePath == null)
            {
                notification.text = "path given isn't valid";
                Debug.Log("Operation cancelled");
            }
            else
            {
                notification.text = "please wait for sample to load";
                Debug.Log("Picked voice recording: " + filePath);
                audioType = filePath.Split('.')[1];
                path = filePath;
                StartCoroutine(loadClip());
            }
        }, null);


    }


    private IEnumerator loadClip()
    {
        audioSource.Stop();
        if (String.Equals(audioType, "mp3"))
        {
            UnityWebRequest webRequest = UnityWebRequest.Get(path);
            yield return webRequest.SendWebRequest();
            if (webRequest.result == UnityWebRequest.Result.Success)
            {
                uploadedAudioClip = NAudioPlayer.FromMp3Data(webRequest.downloadHandler.data);
            }
            else
                UnityEngine.Debug.Log("Error: " + webRequest.error);
        }
        else if (String.Equals(audioType, "wav"))
        {
            UnityWebRequest webRequest = UnityWebRequestMultimedia.GetAudioClip(path, AudioType.WAV);
            yield return webRequest.SendWebRequest();
            if (webRequest.result == UnityWebRequest.Result.Success)
            {
                uploadedAudioClip = DownloadHandlerAudioClip.GetContent(webRequest);
            }
            else
                UnityEngine.Debug.Log("Error: " + webRequest.error);
        }
        else
        {
            Debug.Log("file type is not supported");
        }
        audioSource.clip = uploadedAudioClip;
        Backend_API.instance.AddSampleToProject(uploadedAudioClip);
        notification.text = "finished to load sample";
    }


    public void play_sample()
    {
        audioSource.Play();
    }

    public void stop_sample() { audioSource.Stop();}

}
