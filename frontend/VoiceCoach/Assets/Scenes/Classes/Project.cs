using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;
using UnityEditor;
using System.Collections.Generic;
using System.Diagnostics;
using UnityEngine.UI;

namespace Assets.Scenes.Classes
{
    public class Project
    {
        int id;
        public string title;
        public string description;
        public AudioClip sample;
        public List<AudioClip> userSamples;

        public Project(int id,string title, string description)
        {
            this.id = id;
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
}