using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;
using UnityEditor;
using System.Collections.Generic;

// using System.Diagnostics;
using UnityEngine.UI;
using Assets.Scenes.Classes;
using myToken;
using myError;
using myProject;

// using Api.config;
public class Backend_API : MonoBehaviour
{

    //backend data
    public User currUser;
    public Project currProject;
    public SimpleProject simpleproject;
    public BackendConfig backendConfig;
    public static Backend_API instance;

    private void Awake()
    {
        if (instance == null)
        {
            DontDestroyOnLoad(gameObject);
            this.currUser = null;
            this.currProject = null;
            this.simpleproject = null;
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
                //TODO: check about id.
                currUser = new User(email,token);
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

    public void getUserProjects(Action<List<SimpleProject>> callback)
    {
        Debug.Log("getting...");
        string url = backendConfig.ProjectRoute["get_all"];// + "/" + currUser.email;
        StartCoroutine(GetRequest(url, true, (response) =>
        {
            List<SimpleProject> ans = new List<SimpleProject>();
            if (response.result == "Success")
            {
                Debug.Log("Request successful");
                string projectsData = response.text;
                ProjectWrapper wrapper = JsonUtility.FromJson<ProjectWrapper>(projectsData);
                foreach (var project in wrapper.projects)
                {
                    Debug.Log("Project Name: " + project.name);
                    Debug.Log("Project Description: " + project.description);
                    SimpleProject sp = new SimpleProject(project.id,project.name,project.description);
                    ans.Add(sp);
                }
            }
            else
            {
                Debug.LogError("Request failed: " + response.error);
            }
            callback(ans);
        }));
    }
    public void setSimpleProject(SimpleProject sp)
    {
        Debug.Log("setting the project");
        simpleproject = sp;
        Debug.Log(simpleproject.id);
    }


    //project functions
    public string addProject(string title, string description)
    {
        string url = backendConfig.ProjectRoute["create"];
        //url = url + "/" + currUser.email;
        WWWForm formData = new WWWForm();
        formData.AddField("name", title);
        formData.AddField("description", description);
        StartCoroutine(PostRequest(url, true, formData,(res)=>{
            Debug.Log(res);
            Debug.Log(res.result);
            if(res.result == "Success"){
                addProjectResponse apr = JsonUtility.FromJson<addProjectResponse>(res.text);
                currUser.addProject(apr.projectId,title, description);
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
    public void uploadSample(AudioClip ac,Action<Response> callback){
        string url = backendConfig.ProjectRoute["uploade_main"];
        url = url + "/" + simpleproject.id;
        Debug.Log("trying to uplaod the sample" + url);
        Debug.Log(ac);
        StartCoroutine(SendAudio(ac,url,callback));
        Debug.Log("uploade done");
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
    public IEnumerator SendAudio(AudioClip ac,string url,Action<Response> callback)
    {
        // Convert AudioClip to byte array
        // float[] samples = new float[audioClip.samples * audioClip.channels];
        // audioClip.GetData(samples, 0);
        // byte[] audioData = new byte[samples.Length * 4];
        // Buffer.BlockCopy(samples, 0, audioData, 0, audioData.Length);

        // Create a UnityWebRequest
        //UnityWebRequest webRequest = UnityWebRequest.PostWwwForm(url, "POST");

       

        // // Send the request
        // yield return webRequest.SendWebRequest();
        Debug.Log("288");
        Debug.Log("ac:");
        Debug.Log(ac);
        // Convert the audio clip to a byte array
       // Create a float array to hold the audio data
        float[] samples = new float[ac.samples * ac.channels];
        ac.GetData(samples, 0);

        // Convert the float array to a byte array
        byte[] audioData = ConvertToByteArray(samples);
        // Create a UnityWebRequest
        // Attach audio data as bytes
        // webRequest.uploadHandler = new UploadHandlerRaw(audioData);

        // Set the method to POST
        //webRequest.method = UnityWebRequest.kHttpVerbPOST;

        WWWForm form = new WWWForm();
        form.AddBinaryData("audio", audioData, "audio.wav", "audio/wav");

    // Create a UnityWebRequest
        UnityWebRequest webRequest = UnityWebRequest.Post(url, form);

        // Set the content type
        //webRequest.SetRequestHeader("Content-Type", "audio/wav");
        webRequest.SetRequestHeader("Authorization", "Bearer " + currUser.token);
        // Send the request
        yield return webRequest.SendWebRequest();

        string text = webRequest.downloadHandler.text;
        Response response = new Response.ResponseBuilder()
        .WithResult(webRequest.result == UnityWebRequest.Result.Success ? "Success" : "Fail")
        .WithStatusCode((int) webRequest.responseCode)
        .WithError(webRequest.error)
        .WithData(text)
        .Build();
        callback(response);
    }

    // Method to convert float array to byte array
byte[] ConvertToByteArray(float[] floatArray)
{
    byte[] byteArray = new byte[floatArray.Length * 4];
    Buffer.BlockCopy(floatArray, 0, byteArray, 0, byteArray.Length);
    return byteArray;
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

