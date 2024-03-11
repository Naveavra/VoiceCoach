using Assets.Scenes.Classes;
using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEditor;
using UnityEngine;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

public class UserClassesController : MonoBehaviour
{
    /*    public TMP_Text notifications;
        private string[] scenes = { "My_Projects_Page", "Classes", "Teaching_Classes", "Settings" };*/
    public Button classButton;
    private List<Button> classesButtons = new List<Button>();
    public GameObject addClassScreen;
    public TMP_InputField name_input;
    public TMP_InputField desc_input;
    public GameObject parent;
    public void Start()
    {
        //TODO: dont forget to fix the getClasses function.
        Debug.Log("trying to get projects");
        List<ClassPageDTO> classes = FrontEndAPI.instance.getClasses(FrontEndAPI.instance.currUser.email);
        Debug.Log(classes.Count);
        foreach (ClassPageDTO classDto in classes)
        {
            Button newClassButton = Instantiate(classButton);
            newClassButton.gameObject.SetActive(true);
            Debug.Log(classDto);
            newClassButton.transform.SetParent(parent.transform, true);
            newClassButton.transform.GetChild(0).GetComponent<TMP_Text>().text = classDto.Name;
            classesButtons.Add(newClassButton);

        }
    }

}
