using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEditor;
using IronPython.Hosting;
using System.IO;
using UnityEngine.UI;

public class test : MonoBehaviour
{
    // Start is called before the first frame update
    void Start()
    {
        string path = "Assets/Scenes/py_con/py_scripts/main.py";
        var engine = Python.CreateEngine();
        dynamic py = engine.ExecuteFile(path);
        Debug.Log("end");
    }
}
