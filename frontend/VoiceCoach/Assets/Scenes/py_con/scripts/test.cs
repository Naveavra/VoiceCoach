using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using System.IO;
using UnityEngine.UI;
using UnityEditor.Scripting.Python;

public class test : MonoBehaviour
{
    // Start is called before the first frame update
    void Start()
    {
        string path = "Assets/Scenes/py_con/py_scripts/main.py";
        PythonRunner.RunFile(path);
    }
}
