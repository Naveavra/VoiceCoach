using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class ClockScript : MonoBehaviour
{
    public float timeStart;
    public TMP_Text clock_text;
    public bool clock_enabled = false;

    // Start is called before the first frame update
    void Start()
    {
        clock_text.text = timeStart.ToString("F2");
    }

    // Update is called once per frame
    void Update()
    {
        if (clock_enabled)
        {
            timeStart += Time.deltaTime;
            clock_text.text = timeStart.ToString("F2");
        }
    }

    public void start_clock()
    {
        timeStart = 0;
        clock_enabled = true;
    }

    public void stop_clock()
    {
        clock_enabled = false;
    }
}
