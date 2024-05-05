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
    [System.Serializable]
    public class SimpleProject
    {
        public int id;
        public string title;
        public string description;
        

        public SimpleProject(int id,string title, string description)
        {
            this.id = id;
            this.title = title;
            this.description = description;
        }

    }
}