using System.Collections;
using UnityEngine;
using System.IO;

public class AudioRecorder : MonoBehaviour
{
    public static void SaveRecording(AudioClip clip, string filePath)
    {
        // Convert the AudioClip to a float array
        float[] samples = new float[clip.samples * clip.channels];
        clip.GetData(samples, 0);

        // Create a new WAV file
        FileStream fileStream = new FileStream(filePath, FileMode.Create);
        BinaryWriter binaryWriter = new BinaryWriter(fileStream);

        // Write the WAV file header
        WriteWavHeader(binaryWriter, clip);

        // Write audio data to the file
        foreach (float sample in samples)
        {
            // Convert float audio sample to 16-bit short
            short intSample = (short)(sample * 32767f);
            binaryWriter.Write(intSample);
        }

        // Close the file
        binaryWriter.Close();
        fileStream.Close();
    }

    private static void WriteWavHeader(BinaryWriter writer, AudioClip clip)
    {
        // WAV file header format
        writer.Write(new char[4] { 'R', 'I', 'F', 'F' });
        writer.Write(36 + clip.samples * 2); // File size - 36 + total sample count (16 bits per sample)
        writer.Write(new char[8] { 'W', 'A', 'V', 'E', 'f', 'm', 't', ' ' });
        writer.Write(16); // Sub-chunk size
        writer.Write((short)1); // Audio format (PCM)
        writer.Write((short)clip.channels); // Number of channels
        writer.Write(clip.frequency); // Sample rate
        writer.Write(clip.frequency * 2); // Byte rate (sample rate * block align)
        writer.Write((short)(clip.channels * 2)); // Block align (channels * bits per sample)
        writer.Write((short)16); // Bits per sample
        writer.Write(new char[4] { 'd', 'a', 't', 'a' });
        writer.Write(clip.samples * 2); // Data size
    }
}
