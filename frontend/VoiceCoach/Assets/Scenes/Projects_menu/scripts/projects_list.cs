using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;
using TMPro;
using UnityEngine.SceneManagement;
using Assets.Scenes.Classes;
using UnityEditor.TextCore.Text;

public class projects_list : MonoBehaviour
{
    public Button project;
    private List<Button> projects = new List<Button>();
    public GameObject parent;
    public GameObject pop_up;
    public TMP_InputField name_input;
    public TMP_InputField desc_input;


    public string name;
    public string desc;
    public TMP_Text notifications;

    void Start()
    {
        name_input.onEndEdit.AddListener(readName);
        desc_input.onEndEdit.AddListener(readDesc);
        Debug.Log("trying gets projects");
        Backend_API.instance.getUserProjects((names)=>{
            Debug.Log(names);
            foreach (string name in names)
            {
                Button newProject = Instantiate(project);
                newProject.gameObject.SetActive(true);
                newProject.transform.SetParent(parent.transform, true);
                newProject.transform.GetChild(0).GetComponent<TMP_Text>().text = name;
                projects.Add(newProject);
            }
            });
    }

    public void readName(string s)
    {
        Debug.Log(s);
        name = s;
    }

    public void readDesc(string s)
    {
        Debug.Log(s);
        desc = s;
    }

    public void addProject()
    {
        foreach (Button b in projects)
            if (b.transform.GetChild(0).GetComponent<TMP_Text>().text == name)
            {
                notifications.text = "the name is taken";
                return;
            }
        notifications.text = "";
        Button newProject = Instantiate(project);
        newProject.gameObject.SetActive(true);
        newProject.transform.SetParent(parent.transform, true);
        newProject.transform.GetChild(0).GetComponent<TMP_Text>().text = name;
        projects.Add(newProject);
        pop_up.SetActive(false);
/*        AddProjectDTO addprojectDTO = new AddProjectDTO
        {
            Name = "Project Name",
            Description = "Project Description"
        };*/
        Backend_API.instance.addProject(name, desc);
    }

    public void selectProject()
    {
        string projectName = EventSystem.current.currentSelectedGameObject.transform.GetChild(0).GetComponent<TMP_Text>().text;
        Debug.Log(projectName);
        //Backend_API.instance.getCurProject(projectName);
        SceneManager.LoadScene("project_page");
    }
}
