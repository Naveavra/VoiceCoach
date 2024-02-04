using System;
using System.Collections.Generic;
using UnityEngine;

public class Backend_API : MonoBehaviour
{

    // user data
    public class User
    {
        public string email;
        public string password;

        public User(string email, string password)
        {
            this.email = email;
            this.password = password;
        }

        public bool compare(User other)
        {
            if (other == null)
                return false;
            if (!String.Equals(other.email, this.email) || !String.Equals(other.password, this.password))
                return false;
            return true;
        }

        public bool compare(string email, string password)
        {
            if (!String.Equals(email, this.email) || !String.Equals(password, this.password))
                return false;
            return true;
        }
    }



    public List<User> users;

    public static Backend_API instance;

    private void Awake()
    {
        if (instance == null)
        {
            DontDestroyOnLoad(gameObject);
            instance = this;
        }
    }


    public void addUser(string email, string password)
    {
        if (!isUser(email, password))
            users.Add(new User(email, password));
    }

    public bool isUser(string email, string password)
    {
        foreach (User user in users)
            if (user.compare(email, password))
                return true;
        //now if we not found the user he may be in the backend so we send a request to find him, for now we do nothing
        return false;
    }

    // Start is called before the first frame update
    void Start()
    {
        users = new List<User>();
    }


}
