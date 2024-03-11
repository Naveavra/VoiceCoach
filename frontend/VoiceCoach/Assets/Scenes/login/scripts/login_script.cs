using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;
using TMPro;
using Assets.Scenes;
using System.Net;
using Assets.Scenes.Classes;
using System.Security.Cryptography;

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


    //TODO: FIX WITH ZIV.
    public void checkLogin()
    {
        Backend_API.instance.login(username, password, (res) =>
        {
            if (res.result == "Success")
                SceneManager.LoadScene(sceneName);
            else

                notifications.text = res.text as string;
        });
    }

    /*    public void checkLogin()
        {
            if(FrontEndAPI.instance.login(username, password))
            {
                SceneManager.LoadScene(sceneName);
            }
            else
            {
                notifications.text = "Login failed";
            }
        }
    */
    public void registerPage()
    {
        SceneManager.LoadScene("register_page");
    }
}
