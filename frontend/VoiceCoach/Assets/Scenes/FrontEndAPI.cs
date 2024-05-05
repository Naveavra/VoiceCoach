using Assets.Scenes.Classes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Unity.VisualScripting;
using UnityEditor.TextCore.Text;
using UnityEngine;
using UnityEngine.SceneManagement;

public class FrontEndAPI : MonoBehaviour
{
    Dictionary<string, User> users;
    Dictionary<int, ClassDTO> classes;
    public static FrontEndAPI instance;
    public User currUser;
        
    private void Awake()
    {
        if (instance == null)
        {
            DontDestroyOnLoad(gameObject);
            users = new Dictionary<string, User>();
            classes = new Dictionary<int, ClassDTO>();
            //TODO: remove the user bellow
            this.currUser = new User("yo","yo");
            users.Add(currUser.email, currUser);
            instance = this;
        }
    }

    public bool login(string email, string password)
    {
        //TODO: connect to backEnd API
        if (users.ContainsKey(email) && users[email].token == password)
        {
            currUser = users[email];
            return true;
        }
        else
            return false;
    }

    public bool register(string email, string password) 
    {
        if(users.ContainsKey(email))
        {
            return false;
        }
        else
        {
            users.Add(email, new User(email,password));
            return true;
        }
    }

    public bool joinClass(string useremail,int classID)
    {
        if(!classes.ContainsKey(classID))
        {
            return false;
        }
        else
        {
            //TODO:call the BackEndAPI to join the userId to the class
        }
        return false;
    }

    public List<ClassPageDTO> getClasses(string useremail)
    {
        //TODO:call the BackEndAPI to get list of the user's classes that he attends to.
        //this is just for testing:
        return Enumerable.Range(1, 5).Select(i => new ClassPageDTO { ClassId = $"Class{i}", Name = $"Class {i}", Description = $"Description {i}", TeacherId = $"Teacher{i}" }).ToList();
    }

}