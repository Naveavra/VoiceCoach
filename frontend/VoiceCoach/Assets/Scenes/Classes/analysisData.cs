using System.Collections;
using System.Collections.Generic;
using UnityEngine;


namespace Assets.Scenes.Classes
{
    [System.Serializable]
    public class AnalysisData
    {
        public float offset;
        public float duration;
        public string line;
        public string oldLine;
        public List<string> syllables;


        public AnalysisData(float offset, float duration, string line, string oldLine, List<string> syllables)
        {
            this.offset = offset;
            this.duration = duration;
            this.line = line;
            this.oldLine = oldLine;
            this.syllables = new List<string>();
            foreach (var item in syllables)
            {
                this.syllables.Add(item);
            }

        }
    }
}
