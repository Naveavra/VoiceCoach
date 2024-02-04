using System;
using System.Collections;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using UnityEngine;
using UnityEngine.SceneManagement;

public class register_script : MonoBehaviour
{

    public string username;
    public string password;
    public string passeword_validator;

    public void readUsername(string s)
    {
        username = s;
    }

    public void readPassword(string s)
    {
        password = s;
    }

    public void readPassValidator(string s)
    {
        passeword_validator = s;
    }

    public bool isEmailValid()
    {
        Regex regex = new Regex(@"^([\w\.\-]+)@([\w\-]+)((\.(\w){2,3})+)$", RegexOptions.IgnoreCase);
        return regex.IsMatch(username);
    }

    public bool isPasswordValid()
    {
        return true;
    }

    public void register()
    {
       if (!isEmailValid()) 
        {
            Debug.Log("the email entered is not valid");
        }
       else if (!isPasswordValid())
        {
            Debug.Log("the password entered is not valid");
        }
       else if(!String.Equals(password, passeword_validator))
        {
            Debug.Log("the passwords don't match");
        }
        else
        {
            Debug.Log("registered successfully");
            Backend_API.instance.addUser(username, password);
            SceneManager.LoadScene("login_page");
        }
    }
}
