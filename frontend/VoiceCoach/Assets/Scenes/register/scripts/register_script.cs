using System;
using System.Collections;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using UnityEngine;
using UnityEngine.SceneManagement;
using TMPro;

public class register_script : MonoBehaviour
{
    public TMP_Text notifications;
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
        if(password.Length < 6) return false;
        bool isDigit = false;
        bool isUpper = false;
        bool isLower = false;
        foreach(char c in password){
            if( c >= '0' && c<='9')
                isDigit = true;
            if(c >='a' && c<='z')
                isLower = true;
            if(c >='A' && c<='Z')
                isUpper = true;
        }
        return isDigit && isLower && isUpper;
    }

    public void register()
    {
        if (!isEmailValid())
        {
            notifications.text = "the email entered is not valid";
        }
        else if (!isPasswordValid())
        {
            notifications.text = "the password entered is not valid";
        }
        else if (!String.Equals(password, passeword_validator))
        {
            notifications.text = "the passwords don't match";
        }
        else
        {
            Backend_API.instance.register(username, password,(res)=>{
                if(res.result == "Success")
                    SceneManager.LoadScene("login_page");
                else
                    notifications.text = res.text as string;
            });
        }
    }
}
