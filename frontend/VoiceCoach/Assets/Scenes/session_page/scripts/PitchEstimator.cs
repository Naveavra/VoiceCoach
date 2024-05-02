using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PitchEstimator : MonoBehaviour
{
    [Range(40, 150)]
    public int frequencyMin = 40;

    [Range(300, 1200)]
    public int frequencyMax = 600;

    [Range(1, 8)]
    public int harmonicsToUse = 5;

    public float smoothingWidth = 500;

    public float thresholdSRH = 7;

    const int spectrumSize = 1024;
    const int outputResolution = 200;
    float[] spectrum = new float[spectrumSize];
    float[] specRaw = new float[spectrumSize];
    float[] specCum = new float[spectrumSize];
    float[] specRes = new float[spectrumSize];
    float[] srh = new float[outputResolution];

    public List<float> SRH => new List<float>(srh);


    public float Estimate(AudioSource audioSource)
    {
        var nyquistFreq = AudioSettings.outputSampleRate / 2.0f;

        if (!audioSource.isPlaying) return float.NaN;
        audioSource.GetSpectrumData(spectrum, 0, FFTWindow.Hanning);

        for (int i = 0; i < spectrumSize; i++)
        {
            specRaw[i] = Mathf.Log(spectrum[i] + 1e-9f);
        }


        specCum[0] = 0;
        for (int i = 1; i < spectrumSize; i++)
        {
            specCum[i] = specCum[i - 1] + specRaw[i];
        }

        var halfRange = Mathf.RoundToInt((smoothingWidth / 2) / nyquistFreq * spectrumSize);
        for (int i = 0; i < spectrumSize; i++)
        {
            var indexUpper = Mathf.Min(i + halfRange, spectrumSize - 1);
            var indexLower = Mathf.Max(i - halfRange + 1, 0);
            var upper = specCum[indexUpper];
            var lower = specCum[indexLower];
            var smoothed = (upper - lower) / (indexUpper - indexLower);

            specRes[i] = specRaw[i] - smoothed;
        }

        float bestFreq = 0, bestSRH = 0;
        for (int i = 0; i < outputResolution; i++)
        {
            var currentFreq = (float)i / (outputResolution - 1) * (frequencyMax - frequencyMin) + frequencyMin;

            var currentSRH = GetSpectrumAmplitude(specRes, currentFreq, nyquistFreq);
            for (int h = 2; h <= harmonicsToUse; h++)
            {
                currentSRH += GetSpectrumAmplitude(specRes, currentFreq * h, nyquistFreq);

                currentSRH -= GetSpectrumAmplitude(specRes, currentFreq * (h - 0.5f), nyquistFreq);
            }
            srh[i] = currentSRH;

            if (currentSRH > bestSRH)
            {
                bestFreq = currentFreq;
                bestSRH = currentSRH;
            }
        }

        if (bestSRH < thresholdSRH) return float.NaN;

        return bestFreq;
    }

    float GetSpectrumAmplitude(float[] spec, float frequency, float nyquistFreq)
    {
        var position = frequency / nyquistFreq * spec.Length;
        var index0 = (int)position;
        var index1 = index0 + 1;
        var delta = position - index0;
        return (1 - delta) * spec[index0] + delta * spec[index1];
    }

}
