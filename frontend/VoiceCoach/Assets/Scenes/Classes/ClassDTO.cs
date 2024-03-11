
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Assets.Scenes.Classes
{
    [Serializable]
    public class ClassDTO
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public User Teacher { get; set; }
        public List<User> Students { get; set; }
        //public List<Notification> Notifications { get; set; }
        public List<Task> Tasks { get; set; }
    }
}
