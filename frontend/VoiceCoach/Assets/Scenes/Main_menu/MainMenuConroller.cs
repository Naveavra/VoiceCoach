using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEditor;
using UnityEngine;
using UnityEngine.SceneManagement;

public class MainMenuConroller : MonoBehaviour
{
    public TMP_Text notifications;
    private string[] scenes = { "My_Projects_Page", "Classes", "Teaching_Classes", "Settings" };
    public void MoveToProjectsPage()
    {
        Debug.Log("got here");
        SceneManager.LoadScene(scenes[0]);
    }
    public void MoveToClassesPage()
    {
        Debug.Log("Not implemented Yet");
    }
    public void MoveToTeachingClassesPage()
    {
        Debug.Log("Not implemented Yet");
    }
    public void MoveToSettingsPage()
    {
        Debug.Log("Not implemented Yet");
    }
}
