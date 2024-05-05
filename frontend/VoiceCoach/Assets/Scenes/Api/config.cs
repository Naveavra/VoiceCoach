using System;
using UnityEngine;
using System.Collections.Generic;
public class BackendConfig : ScriptableObject
{
    public string backendPath;
    public Dictionary<string,string> AuthRoute;
    public Dictionary<string,string> ProjectRoute;
    public int backendPort;

    // Constructor
    public BackendConfig()
    {
        backendPath = "http://127.0.0.1:5000/";

        AuthRoute =  new Dictionary<string, string>();
        AuthRoute["login"] = backendPath + "users/login";
        AuthRoute["register"]= backendPath + "users/register";
        
        ProjectRoute = new Dictionary<string, string>();
        ProjectRoute["create"] = backendPath + "projects/create";
        ProjectRoute["get_all"] = backendPath + "projects/get_all";
        
        ProjectRoute["add_sample"] = backendPath + "projects/addSample";
        ProjectRoute["uploade_main"] = backendPath + "projects/uploade_main";
        
        
        
        backendPort = 5000;

    }
}