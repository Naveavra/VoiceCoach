using UnityEngine;
using System.Collections.Generic;

public class ConfigManager : MonoBehaviour
{
    public BackendConfig backendConfig; // Reference to the ScriptableObject asset
    
    void Start()
    {
        // Access configuration properties
        string apiURL = backendConfig.backendPath; // Change backendAPI to backendPath
        Dictionary<string,string> authRoute = backendConfig.AuthRoute; // Change AuthRoute to authRoute
        int port = backendConfig.backendPort;

        Debug.Log("Backend API URL: " + apiURL);
        Debug.Log("Backend Port: " + port);
    }
}