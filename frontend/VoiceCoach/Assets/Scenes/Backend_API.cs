using System;
using UnityEngine;
using System.Collections.Generic;
using UnityEngine.UI;
using Assets.Scenes.Classes;
using myToken;
using myError;
using myProject;
using System.IO;
using UnityEngine.Networking;
using System.Collections;
using NAudio.Wave;

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
            this.currProject = null;
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

    public void getUserProjects(Action<List<Project>> callback)
    {
        Debug.Log("getting...");
        string url = backendConfig.ProjectRoute["get_all"] + "/" + UnityWebRequest.EscapeURL(currUser.email);
        StartCoroutine(GetRequest(url, true, (response) =>
        {
            List<Project> ans = new List<Project>();
            if (response.result == "Success")
            {
                Debug.Log("Request successful");
                string projectsData = response.text;
                ProjectWrapper wrapper = JsonUtility.FromJson<ProjectWrapper>(projectsData);
                foreach (var project in wrapper.projects)
                {
                    Project p = new Project(project);
                    ans.Add(p);
                    currUser.addProject(p);
                }
            }
            else
            {
                Debug.LogError("Request failed: " + response.error);
            }

            foreach(var project in ans)
                Debug.Log("Project Name: " + project.title);
            callback(ans);
        }));
    }


    //project functions
    public void addProject(string title, string description)
    {
        string url = backendConfig.ProjectRoute["create"] + "/" + UnityWebRequest.EscapeURL(currUser.email);
        WWWForm formData = new WWWForm();
        formData.AddField("name", title);
        formData.AddField("description", description);
        StartCoroutine(PostRequest(url, true, formData,(res)=>{
            Debug.Log(res);
            Debug.Log(res.result);
            if(res.result == "Success"){
                addProjectResponse apr = JsonUtility.FromJson<addProjectResponse>(res.text);
                currUser.addProject(apr.projectId, title, description);
                Debug.Log("suc-106");
            }
            else{
                Debug.Log("fail-109");
            }
        }));
    }

    public void setCurrProject(string name)
    {
        currProject = currUser.getProject(name);
    }

    public IEnumerator UpdateProjectWithSample(AudioClip sample)
    {
        // Convert AudioClip to byte array
        byte[] audioData = ConvertToByteArray(sample);

        // Convert byte array to Base64 string (if needed)
        string base64Audio = System.Convert.ToBase64String(audioData);
        // Create JSON data
        string jsonData = "{\"sample\":\"" + base64Audio + "\", \"nchannels\":" + sample.channels + ", \"samplewidth\":16, \"framerate\":" + sample.frequency + "}";

        // Create UnityWebRequest
        UnityWebRequest www = UnityWebRequest.Put(backendConfig.ProjectRoute["add_sample"] + "/" + UnityWebRequest.EscapeURL(currProject.id+""), jsonData);
        www.method = "PUT";
        www.SetRequestHeader("Content-Type", "application/json");
        www.SetRequestHeader("Authorization", "Bearer " + currUser.token);

        // Send request
        yield return www.SendWebRequest();

        if (www.result != UnityWebRequest.Result.Success)
        {
            Debug.Log(www.error);
        }
        else
        {
            Debug.Log("Sample added to project successfully!");
            currUser.addSampleForProject(currProject.title, sample);
        }
    }

    public void AddSampleToProject(AudioClip sample)
    {
        StartCoroutine(UpdateProjectWithSample(sample));
    }


    byte[] ConvertToByteArray(AudioClip clip)
    {
        // Convert AudioClip to WAV byte array
        using (MemoryStream memoryStream = new MemoryStream())
        {
            using (BinaryWriter writer = new BinaryWriter(memoryStream))
            {
                // Write WAV header
                writer.Write(new char[4] { 'R', 'I', 'F', 'F' });
                writer.Write(36 + clip.samples * 2);
                writer.Write(new char[4] { 'W', 'A', 'V', 'E' });
                writer.Write(new char[4] { 'f', 'm', 't', ' ' });
                writer.Write(16);
                writer.Write((ushort)1);
                writer.Write((ushort)clip.channels);
                writer.Write(clip.frequency);
                writer.Write(clip.frequency * clip.channels * 2);
                writer.Write((ushort)(clip.channels * 2));
                writer.Write((ushort)16);
                writer.Write(new char[4] { 'd', 'a', 't', 'a' });
                writer.Write(clip.samples * 2);

                // De-interleave and write samples
                float[] samples = new float[clip.samples * clip.channels];
                clip.GetData(samples, 0);
                for (int i = 0; i < clip.samples; i++)
                {
                    for (int j = 0; j < clip.channels; j++)
                    {
                        float sample = samples[i * clip.channels + j];
                        writer.Write((short)(sample * 32767f));
                    }
                }
            }

            return memoryStream.ToArray();
        }
    }



    public void getCurProject(string name)
    {
        currProject = currUser.getProject(name);
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

