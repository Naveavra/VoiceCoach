using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;
using UnityEditor;
using System.Collections.Generic;
using UnityEngine.UI;
using myProject;
using Assets.Scenes.Classes;


namespace Assets.Scenes.Classes
{
    public class Project
    {

        public int id;
        public string title;
        public string description;
        public AudioClip sample;
        public List<Session> sessions;
        
        public Project(int id, string title, string description)
        {
            this.id = id;
            this.title = title;
            this.description = description;
            sample = null;
        }

        public Project(ProjectResponse response)
        {
            this.id = response.id;
            this.title = response.name;
            this.description = response.description;
            sample = null;
        }

        public void addSample(AudioClip sample)
        {
            this.sample = sample;
        }
    }
}