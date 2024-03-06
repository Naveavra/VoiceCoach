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
        public List<Project> projects;

        public User(string email, string password)
        {
            this.email = email;
            this.password = password;
            this.projects = new List<Project>();
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

        public string addProject(string title, string description)
        {
            foreach (Project project in projects)
                if (project.title == title)
                    return "the project name is already taken";

            projects.Add(new Project(title, description));
            return "";

        }

        public string addSampleForProject(string title, AudioClip sample)
        {
            foreach (Project project in projects)
                if (project.title == title)
                {
                    project.addSample(sample);
                }
            return "no project has this name";
        }

        public string addUserSampleForProject(string title, AudioClip userSample)
        {
            foreach (Project project in projects)
                if (project.title == title)
                {
                    project.addUserSample(userSample);
                }
            return "no project has this name";
        }

        public void removeProject(string title)
        {
            foreach (Project p in projects)
            {
                if (p.title.Equals(title))
                    projects.Remove(p);
            }
        }

    }


    //project data
    public class Project
    {
        public string title;
        public string description;
        public AudioClip sample;
        public List<AudioClip> userSamples;

        public Project(string title, string description)
        {
            this.title = title;
            this.description = description;
            sample = null;
            userSamples = new List<AudioClip>();
        }

        public void addSample(AudioClip sample)
        {
            this.sample = sample;
        }

        public void addUserSample(AudioClip userSample)
        {
            this.userSamples.Add(userSample);
        }
    }


    //backend data
    public User currUser;

    public Project currProject;

    public string backendPath = "http://127.0.0.1:5000/";

    public static Backend_API instance;


    private void Awake()
    {
        if (instance == null)
        {
            DontDestroyOnLoad(gameObject);
            this.currUser = null;
            instance = this;
        }
    }

    //user functions
    public bool isUser(string email, string password)
    {
        if (currUser != null && currUser.email == email && currUser.password == password)
            return true;
        //check in backend
        return false;
    }

    public bool login(string username, string password)
    {
        if (isUser(username, password))
            return true;//we need to add here that the currUser will change here, for now it only changes in register
        return false;

    }

    public bool register(string username, string password)
    {
        if (!isUser(username, password))
        {
            //add credantials to backend
            currUser = new User(username, password);
            return true;
        }
        return false;
    }

    public bool isEmailTaken(string email)
    {
        if (currUser != null && currUser.email == email)
            return true;
        //check in backend
        return false;
    }

    public List<String> getUserProjects()
    {
        //use python function to get from the DB all the projects to display them, now we only get the name each project
        return new List<String>();
    }



    //project functions
    public string addProject(string title, string description)
    {
        return currUser.addProject(title, description);
    }

    public string addSampleForUser(string title, AudioClip sample)
    {
        return currUser.addSampleForProject(title, sample);
    }

    public string addUserSampleForUser(string title, AudioClip userSample)
    {
        return currUser.addUserSampleForProject(title, userSample);
    }

    public void getCurProject(string name)
    {
        foreach (Project project in currUser.projects)
            if (project.title == name)
            {
                currProject = project;
            }
    }










    //calling to requests for backend, this will be replaced with running python code
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
    public IEnumerator GetAudioRequest(AudioClip clip, string url)
    {
        using (UnityWebRequest webRequest = UnityWebRequestMultimedia.GetAudioClip(url, AudioType.WAV))
        {
            yield return webRequest.SendWebRequest();
            if (webRequest.result == UnityWebRequest.Result.Success)
            {
                clip = DownloadHandlerAudioClip.GetContent(webRequest);
                UnityEngine.Debug.Log("length: " + clip.length);
                //player.PlayOneShot(clip);
            }
            else
            {
                UnityEngine.Debug.Log("Error: " + webRequest.error);
            }
        }
    }

    //getting image from backend
    public IEnumerator GetImageRequest(Image img, string url)
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