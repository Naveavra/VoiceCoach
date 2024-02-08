using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Sample_script : MonoBehaviour
{

    public GameObject vis;
    private List<GameObject> visSampleArray = new List<GameObject>();

    public float minHeight;
    public float maxHeight;
    public float updateSentivity;


    public int visualizerSimples;

    public AudioSource audioSource;

    public AudioClip audioClip;
    public bool loop = true;


    // Start is called before the first frame update
    void Start()
    {
        //values we need
        minHeight = 0.1f;
        maxHeight = 1.5f;
        updateSentivity = 0.5f;
        visualizerSimples = 1024;

        addClipForSample();

    }

    private void addClipForSample()
    {
        float x = -2.7f;
        while (x <= 2.7f)
        {
            GameObject visClone = Instantiate(vis);
            visClone.transform.position = new Vector3(x, 2.5f, 1.0f);
            visSampleArray.Add(visClone);
            x = x + 0.3f;
        }

        audioSource.loop = loop;
        audioSource.clip = audioClip;

        audioSource.Play();
    }

    void FixedUpdate()
    {
        float[] spectrumData = audioSource.GetSpectrumData(visualizerSimples, 0, FFTWindow.Hanning);
        for (int i = 0; i < visSampleArray.Count; i++)
        {
            float y = Mathf.Clamp(Mathf.Lerp(visSampleArray[i].transform.localScale.y, minHeight + (spectrumData[i] * (maxHeight - minHeight) * 20.0f), updateSentivity * 0.5f), minHeight, maxHeight);
            visSampleArray[i].transform.localScale = new Vector3(0.1f, y, 1.0f);
        }
    }
}
