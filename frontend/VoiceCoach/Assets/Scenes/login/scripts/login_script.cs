using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;
using UnityEngine;
using UnityEngine.SceneManagement;

public class login_script : MonoBehaviour
{
    public string sceneName = "main_manu_page";
    public string username;
    public string password;


    // Start is called before the first frame update
    void Start()
    {
        UnityEngine.Debug.Log(Backend_API.instance.isUser("", ""));
    }

    public void readUsername(string s)
    {
        username = s;
    }

    public void readPassword(string s)
    {
        password = s;
    }

    public void checkLogin()
    {
        if (Backend_API.instance.isUser(username, password))
        {
            UnityEngine.Debug.Log("logging");
            UnityEngine.Debug.Log("main_manu_page");
            SceneManager.LoadScene("main_manu_page");
        }
        else
            UnityEngine.Debug.Log("not logging");
    }

    public void registerPage()
    {
        UnityEngine.Debug.Log("register_page");
        SceneManager.LoadScene("register_page");
    }
}
