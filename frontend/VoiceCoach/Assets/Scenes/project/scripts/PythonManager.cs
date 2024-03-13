using System;
using UnityEngine;
using System.Collections;
using System.Diagnostics;
using System.IO;
using IronPython.Hosting;
using Microsoft.Scripting.Hosting;
using System.Collections.Generic;

namespace Assets.Scenes.project.python
{
    public class PythonManager
    {
        private Process pythonProcess;

        public void StartPythonProcess()
        {
            string pythonExe = "Library/PythonInstall/python.exe";

            ProcessStartInfo start = new ProcessStartInfo
            {
                FileName = pythonExe,
                RedirectStandardInput = true,
                RedirectStandardOutput = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            pythonProcess = new Process
            {
                StartInfo = start
            };

            pythonProcess = Process.Start(start);

            // Optionally, you can send an initial command or script to the Python process here
            // Example: SendCommandToPython("print('Python process is ready.')");
        }

        public void SendCommandToPython(string command)
        {
            if (pythonProcess != null && !pythonProcess.HasExited)
            {
                pythonProcess.StandardInput.WriteLine(command);
            }
        }

        public IEnumerator RunPythonScriptFile(string scriptFilePath)
        {
            if (File.Exists(scriptFilePath))
            {
                string scriptContent = File.ReadAllText(scriptFilePath);
                SendCommandToPython(scriptContent);
                yield return new WaitForSeconds(10.0f);
            }
        }

        public void RunIronPythonScript(string path)
        {
            var engine = Python.CreateEngine();
            var scope = engine.CreateScope();

            try
            {
                string dir = Path.GetDirectoryName(path);
                ICollection<string> paths = engine.GetSearchPaths();

                if (!String.IsNullOrWhitespace(dir))
                {
                    paths.Add(dir);
                }
                else
                {
                    paths.Add(Environment.CurrentDirectory);
                }
                engine.SetSearchPaths(paths);
                string pythonCode = System.IO.File.ReadAllText(path);
                engine.Execute(pythonCode, scope);
            }
            catch (Exception e)
            {
                UnityEngine.Debug.LogError("IronPython Error: " + e.Message);
            }
        }

        public void StopPythonProcess()
        {
            if (pythonProcess != null && !pythonProcess.HasExited)
            {
                pythonProcess.WaitForExit();
                pythonProcess.Close();
            }
        }
    }
}