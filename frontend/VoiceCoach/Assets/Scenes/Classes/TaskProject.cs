
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Assets.Scenes.Classes;

namespace Assets.Scenes.Classes
{
    public class TaskProject : Project
    {
        public List<Notification> Feedbacks { get; set; }
        public TaskProject(string title, string description) : base(title, description)
        {
        }
    }
}
