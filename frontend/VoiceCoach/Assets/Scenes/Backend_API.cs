using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;
using UnityEditor;
using System.Collections.Generic;
// using System.Diagnostics;
using UnityEngine.UI;
using MyUser;
using MyProject;
using MyResponse;
using myToken;
using myError;
using myProject;

// using Api.config;
public class Backend_API : MonoBehaviour
{

    //backend data
    public User currUser;
    public Project currProject;
    public BackendConfig backendConfig;
    public static Backend_API instance;

    private void Awake()
    {
        if (instance == null)
        {
            DontDestroyOnLoad(gameObject);
            this.currUser = null;
            instance = this;
            backendConfig = new BackendConfig();
        }
    }

   
    public void login(string email, string password,Action<Response> callback)
    {
        WWWForm formData = new WWWForm();
        formData.AddField("email", email);
        formData.AddField("password", password);
        Debug.Log("login" + formData + " " + backendConfig.AuthRoute["login"]);
        StartCoroutine(PostRequest(backendConfig.AuthRoute["login"],false, formData,(res)=>{
            if(res.result == "Success"){
                TokenResponse tr = JsonUtility.FromJson<TokenResponse>(res.text);
                Debug.Log("tr: " + tr);
                string token = tr.token;
                string user_id = tr.user_id;
                currUser = new User(email,token,Int32.Parse(user_id));
                Debug.Log("token: " + token);
                callback(res);
            }
            else{
                string error = res.text;
                Debug.Log("error as text: " + error);
                ErrorResponse er = JsonUtility.FromJson<ErrorResponse>(error);
                Debug.Log("er: " + er);
                res.text = er.error;
                callback(res);
            }
            
        }));
    }

    public void register(string email, string password ,Action<Response> callback)
    {
        WWWForm formData = new WWWForm();
        formData.AddField("email", email);
        formData.AddField("password", password);
        Debug.Log("register" + formData + " " + backendConfig.AuthRoute["register"]);
        StartCoroutine(PostRequest(backendConfig.AuthRoute["register"],false, formData,(res)=>{
            if(res.result == "Success"){
                callback(res);
            }
            else{
                string error = res.text;
                Debug.Log("error as text: " + error);
                ErrorResponse er = JsonUtility.FromJson<ErrorResponse>(error);
                Debug.Log("er: " + er);
                res.text = er.error;
                callback(res);
            }
            
        }));
    }

    public void getUserProjects(Action<List<string>> callback)
    {
        Debug.Log("getting...");
        string url = backendConfig.ProjectRoute["get_all"] + "/" + currUser.user_id;
        StartCoroutine(GetRequest(url, true, (response) =>
        {
            List<string> ans = new List<string>();
            if (response.result == "Success")
            {
                Debug.Log("Request successful");
                string projectsData = response.text;
                ProjectWrapper wrapper = JsonUtility.FromJson<ProjectWrapper>(projectsData);
                foreach (var project in wrapper.projects)
                {
                    Debug.Log("Project Name: " + project.name);
                    Debug.Log("Project Description: " + project.description);
                    ans.Add(project.name);
                }
            }
            else
            {
                Debug.LogError("Request failed: " + response.error);
            }
            callback(ans);
        }));
    }


    //project functions
    public string addProject(string title, string description)
    {
        string url = backendConfig.ProjectRoute["create"];
        url = url + "/" + currUser.user_id;
        WWWForm formData = new WWWForm();
        formData.AddField("name", title);
        formData.AddField("description", description);
        StartCoroutine(PostRequest(url, true, formData,(res)=>{
            Debug.Log(res);
            Debug.Log(res.result);
            if(res.result == "Success"){
                currUser.addProject(title, description);
                Debug.Log("suc-106");
            }
            else{
                Debug.Log("fail-109");
            }
        }));
        return "success";
    }

    public string addSampleForUser(string title, AudioClip sample)
    {
        return currUser.addSampleForProject(title, sample);
    }

    public string addUserSampleForUser(string title, AudioClip userSample)
    {
        return currUser.addUserSampleForProject(title, userSample);
    }

    public void getCurProject(string name)
    {
        foreach (Project project in currUser.projects)
            if (project.title == name)
            {
                currProject = project;
            }
    }


    //calling to requests for backend, this will be replaced with running python code
    public IEnumerator GetRequest(string url,Boolean secure , Action<Response> callback)
    {
        using (UnityWebRequest webRequest = UnityWebRequest.Get(url))
        {
            if (secure)
            {
                webRequest.SetRequestHeader("Authorization", "Bearer " + currUser.token);
            }
            yield return webRequest.SendWebRequest();
            Debug.Log("165");
            UnityEngine.Debug.Log(webRequest.downloadHandler.text);
            string text = webRequest.downloadHandler.text;
            Debug.Log(text);
            Response response = new Response.ResponseBuilder()
            .WithResult(webRequest.result == UnityWebRequest.Result.Success ? "Success" : "Fail")
            .WithStatusCode((int) webRequest.responseCode)
            .WithError(webRequest.error)
            .WithData(text)
            .Build();
            callback(response);
        }
    }
    public IEnumerator PostRequest(string url,Boolean secure, WWWForm formData,Action<Response> callback)
    {
        using (UnityWebRequest webRequest = UnityWebRequest.Post(url, formData))
        {
            if (secure)
            {
                webRequest.SetRequestHeader("Authorization", "Bearer " + currUser.token);
            }
            yield return webRequest.SendWebRequest();
            // if (webRequest.result == UnityWebRequest.Result.Success)
            // {
            //     int statusCode = (int)webRequest.responseCode;
            //     if(statusCode == 200)
            //     {
            //         string text = webRequest.downloadHandler.text;
            //         Dictionary<string, object> responseData = JsonConvert.DeserializeObject<Dictionary<string, object>>(text);
            //         response 
            //         .WithResult("Success")
            //         .WithStatusCode(200)
            //         .WithError(null)
            //         .WithData(responseData)
            //         .Build();
            //         callback(response);
            //     }
            //     else
            //     {
            //         response
            //         .WithResult("Fail")
            //         .WithStatusCode(statusCode)
            //         .WithError(webRequest.error)
            //         callback(response);
            //     }
            // }
            // else
            // {
            //     Debug.LogError("Error: " + webRequest.error);
            //     Debug.Log("Response: " + webRequest.downloadHandler.text);
            //     response
            //     .WithResult("Fail")
            //     .WithStatusCode((int)webRequest.responseCode)
            //     .WithError(webRequest.error)
            //     callback(response);
            // }
            string text = webRequest.downloadHandler.text;
            Response response = new Response.ResponseBuilder()
            .WithResult(webRequest.result == UnityWebRequest.Result.Success ? "Success" : "Fail")
            .WithStatusCode((int) webRequest.responseCode)
            .WithError(webRequest.error)
            .WithData(text)
            .Build();
            callback(response);
        }
    }

    //getting an .wav audio file from backend
    public IEnumerator GetAudioRequest(AudioClip clip, string url)
    {
        using (UnityWebRequest webRequest = UnityWebRequestMultimedia.GetAudioClip(url, AudioType.WAV))
        {
            yield return webRequest.SendWebRequest();
            if (webRequest.result == UnityWebRequest.Result.Success)
            {
                clip = DownloadHandlerAudioClip.GetContent(webRequest);
                UnityEngine.Debug.Log("length: " + clip.length);
                //player.PlayOneShot(clip);
            }
            else
            {
                UnityEngine.Debug.Log("Error: " + webRequest.error);
            }
        }
    }

    //getting image from backend
    public IEnumerator GetImageRequest(Image img, string url)
    {
        using (UnityWebRequest webRequest = UnityWebRequestTexture.GetTexture(url))
        {
            yield return webRequest.SendWebRequest();
            if (webRequest.result == UnityWebRequest.Result.Success)
            {
                Texture2D tex = DownloadHandlerTexture.GetContent(webRequest);
                UnityEngine.Debug.Log("width: " + tex.width + " height: " + tex.height);
                var width = tex.width;
                var height = tex.height;
                img.sprite = Sprite.Create(tex, new Rect(0, 0, width, height), new Vector2(0.5f, 0.5f), 100);

            }
            else
            {
                UnityEngine.Debug.Log("Error: " + webRequest.error);
            }
        }
    }



}

