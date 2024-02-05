using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;
using UnityEditor;
using System.Collections.Generic;
using System.Diagnostics;
using UnityEngine.UI;

public class Backend_API : MonoBehaviour
{
    // user data
    public class User
    {
        public string email;
        public string password;

        public User(string email, string password)
        {
            this.email = email;
            this.password = password;
        }

        public bool compare(User other)
        {
            if (other == null)
                return false;
            if (!String.Equals(other.email, this.email) || !String.Equals(other.password, this.password))
                return false;
            return true;
        }

        public bool compare(string email, string password)
        {
            if (!String.Equals(email, this.email) || !String.Equals(password, this.password))
                return false;
            return true;
        }
    }


    //project data
    public class Project
    {
        public string title;
        public string description;
        public AudioClip sample;
        public AudioClip userSample;

        public Project(string title, string description)
        {
            this.title = title;
            this.description = description;
            sample = null;
            userSample = null;
        }

        public void addSample()
        {
            //search in explorer and add only files of type .mp4, .m4a, .wav
            string path = EditorUtility.OpenFilePanel("choose a sample file of type .mp3/.m4a/.wav", "", "");

            //change this with the code you found from the video that shows an app that uses audio files, in whatsapp search "הסרטון כאן"
            if (path != null)
            {
                /*
                string pathType = path.Split('.')[path.Split('.').Length - 1];
                UnityEngine.Debug.Log(path);
                if (pathType == ".mp3" || pathType == ".m4a" || pathType == ".wav")
                {
                    WWW www = new WWW("file:///" + path);
                    sample = www.GetAudioClip(false, true);
                    UnityEngine.Debug.Log(sample);
                }
                else
                {
                    UnityEngine.Debug.Log("file not of correct type");
                }
                */

            }
        }

        public void recordUserSample()
        {
            //audio visualization page
        }

        public void showAnalysis()
        {
            //go to analysis page if both the sample and userSample are given.
        }
    }

    public List<User> users;

    public string backendPath = "http://127.0.0.1:5000/";

    public static Backend_API instance;

    //temp
    public AudioSource player;
    public Image img;

    private void Awake()
    {
        if (instance == null)
        {
            DontDestroyOnLoad(gameObject);
            instance = this;
        }
    }


    public void addUser(string email, string password)
    {
        if (!isUser(email, password))
            users.Add(new User(email, password));
    }

    public bool isUser(string email, string password)
    {
        foreach (User user in users)
            if (user.compare(email, password))
                return true;
        //now if we not found the user he may be in the backend so we send a request to find him, for now we do nothing
        return false;
    }

    // Start is called before the first frame update
    void Start()
    {
        users = new List<User>();
        StartCoroutine(GetRequest("http://127.0.0.1:5000/"));
        StartCoroutine(GetAudioRequest("http://127.0.0.1:5000/song"));
        StartCoroutine(GetImageRequest("http://127.0.0.1:5000/image"));
    }





    //calling to requests for backend
    public IEnumerator GetRequest(string url)
    {
        using (UnityWebRequest webRequest = UnityWebRequest.Get(url))
        {
            yield return webRequest.SendWebRequest();
            if (webRequest.result == UnityWebRequest.Result.Success)
            {
                UnityEngine.Debug.Log(webRequest.downloadHandler.text);
            }
            else
            {
                UnityEngine.Debug.Log("Error: " + webRequest.error);
            }
        }
    }

    //getting an .wav audio file from backend
    public IEnumerator GetAudioRequest(string url)
    {
        using (UnityWebRequest webRequest = UnityWebRequestMultimedia.GetAudioClip(url, AudioType.WAV))
        {
            yield return webRequest.SendWebRequest();
            if (webRequest.result == UnityWebRequest.Result.Success)
            {
                AudioClip clip = DownloadHandlerAudioClip.GetContent(webRequest);
                UnityEngine.Debug.Log("length: " + clip.length);
                player.PlayOneShot(clip);
            }
            else
            {
                UnityEngine.Debug.Log("Error: " + webRequest.error);
            }
        }
    }

    //getting image from backend
    public IEnumerator GetImageRequest(string url)
    {
        using (UnityWebRequest webRequest = UnityWebRequestTexture.GetTexture(url))
        {
            yield return webRequest.SendWebRequest();
            if (webRequest.result == UnityWebRequest.Result.Success)
            {
                Texture2D tex = DownloadHandlerTexture.GetContent(webRequest);
                UnityEngine.Debug.Log("width: " + tex.width + " height: " + tex.height);
                var width = tex.width;
                var height = tex.height;
                img.sprite = Sprite.Create(tex, new Rect(0, 0, width, height), new Vector2(0.5f, 0.5f), 100);

            }
            else
            {
                UnityEngine.Debug.Log("Error: " + webRequest.error);
            }
        }
    }


}
