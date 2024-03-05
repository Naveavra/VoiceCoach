using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using TMPro;

public class login_script : MonoBehaviour
{
    public TMP_Text notifications;
    private string sceneName = "Main_menu_Page";
    public string username;
    public string password;

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
            SceneManager.LoadScene(sceneName);
        }
        else
            notifications.text = "no such user has this credantials";
    }

    public void registerPage()
    {
        SceneManager.LoadScene("register_page");
    }
}
