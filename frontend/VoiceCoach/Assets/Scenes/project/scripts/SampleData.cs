using System.Collections;
using System.Collections.Generic;
using UnityEngine;


namespace Assets.Scenes.project.data
{
    [System.Serializable]
    public class SampleData
    {
        public string path;
        public float offset;
        public float duration;
        public List<string> lines;
        public List<string> syllables;
    }
}
