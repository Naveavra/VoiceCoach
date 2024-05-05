using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;
using UnityEditor;
using System.Collections.Generic;
using System.Diagnostics;
using UnityEngine.UI;
using Assets.Scenes.Classes;

namespace Assets.Scenes.Classes
{
    public class User
    {
        public string email;
        public string token;
        public Dictionary<string, Project> projects = new Dictionary<string, Project>();
        public List<int> assignedClasses;
        public List<int> CreatedClasses;

        public User(string email,string token)
        {
            this.email = email;
            this.token = token;
            projects = new Dictionary<string, Project>();
            assignedClasses = new List<int>();
            CreatedClasses = new List<int>();  
        }

        public void addProject(Project project)
        {
            this.projects[project.title] = project;
        }
              
        public string addProject(int id, string title, string description)
        {
            if (this.projects[title] != null)
                return "the project name is already taken";

            this.projects[title] = new Project(id, title, description);
            return "";

        }

        public Project getProject(string name)
        {
            return projects[name];
        }
        
        public string addSampleForProject(string title, AudioClip sample)
        {
            Project p = projects[title];
            if (p != null)
            {
                p.sample = sample;
                return"";
            }
            return "no project has this name";
        }

        public void removeProject(string title)
        {
            projects.Remove(title);
        }
    }
}