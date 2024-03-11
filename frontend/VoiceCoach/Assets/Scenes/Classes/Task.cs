using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UnityEngine;

namespace Assets.Scenes.Classes
{
    [Serializable]
    public class Task
    {
        public string Id { get; set; }
        public string ClassId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public AudioClip Sample { get; set; }
        public List<TaskProject> StudentProjects { get; set; }
    }
}
