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
    public class User
    {
        public string email;
        public string token;
        public List<Project> projects;
        public List<int> assignedClasses;
        public List<int> CreatedClasses;

        public User(string email,string token)
        {
            this.email = email;
            this.token = token;
            projects = new List<Project>();
            assignedClasses = new List<int>();
            CreatedClasses = new List<int>();  
        }

        public void addProject(Project project)
        {
            this.projects.Add(project);
        }
              
        public string addProject(int id , string title, string description)
        {
            foreach (Project project in projects)
                if (project.title == title)
                    return "the project name is already taken";

            projects.Add(new Project(id,title, description));
            return "";

        }

            public string addSampleForProject(string title, AudioClip sample)
            {
                foreach (Project project in projects)
                    if (project.title == title) {
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
                    if(p.title.Equals(title))
                        projects.Remove(p);
                }
            }
    }
}