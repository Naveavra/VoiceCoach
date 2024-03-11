using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.IO;
using System;
//using UnityEditor.Scripting.Python;

public class FeedbackAnalyzer : MonoBehaviour
{
    public TMP_Text notifications;
    // Start is called before the first frame update
    void Start()
    {
        string path = "Assets/Scenes/py_con/py_scripts/main.py";
        //PythonRunner.RunFile(path);
        string filePath = "Assets/Scenes/py_con/files/feedback.txt";
        try
        {
            using (StreamReader reader = new StreamReader(filePath))
            {
                string line;
                while ((line = reader.ReadLine()) != null)
                {
                    notifications.text += line;
                }
            }
        }
        catch (Exception e) {
            notifications.text += "no bueno";
        }
    }

}
