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
        Backend_API.instance.login(username, password,(res)=>
        {
            if(res.result == "Success")
                SceneManager.LoadScene(sceneName);
            else
                
                notifications.text = res.text as string;
        });
    }

    public void registerPage()
    {
        SceneManager.LoadScene("register_page");
    }
}
