using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;
using TMPro;
using UnityEngine.SceneManagement;
using Assets.Scenes.Classes;

public class projects_list : MonoBehaviour
{
    public Button projectButton;
    private List<Button> projectsButtons = new List<Button>();
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
        Backend_API.instance.getUserProjects((ans)=>{
            foreach (Project project in ans)
            {
                Button newProject = Instantiate(projectButton);
                newProject.gameObject.SetActive(true);
                newProject.transform.SetParent(parent.transform, true);
                newProject.transform.GetChild(0).GetComponent<TMP_Text>().text = project.title;
                projectsButtons.Add(newProject);
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
        foreach (Button b in projectsButtons)
            if (b.transform.GetChild(0).GetComponent<TMP_Text>().text == name)
            {
                notifications.text = "the name is taken";
                return;
            }
        notifications.text = "";
        Button newProject = Instantiate(projectButton);
        newProject.gameObject.SetActive(true);
        newProject.transform.SetParent(parent.transform, true);
        newProject.transform.GetChild(0).GetComponent<TMP_Text>().text = name;
        projectsButtons.Add(newProject);
        pop_up.SetActive(false);

        Backend_API.instance.addProject(name, desc);
    }

    public void selectProject()
    {
        string projectName = EventSystem.current.currentSelectedGameObject.transform.GetChild(0).GetComponent<TMP_Text>().text;
        Backend_API.instance.setCurrProject(projectName);
        SceneManager.LoadScene("project_page");
    }
}
