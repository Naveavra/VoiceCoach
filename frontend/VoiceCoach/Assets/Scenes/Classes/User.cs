using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;
using UnityEditor;
using System.Collections.Generic;
using System.Diagnostics;
using MyProject;
using UnityEngine.UI;

namespace MyUser
{
    public class User
    {
        public int user_id;
        public string username;
        public string email;
        public string token;
        public List<Project> projects;

        public User(string email,string token , int userId)
        {
            this.email = email;
            this.token = token;
            this.user_id = userId;
            this.projects = new List<Project>();
        }

        public void addProject(Project project)
        {
            this.projects.Add(project);
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