Set objShell = CreateObject("WScript.Shell")
strPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
objShell.Run """msedge.exe"" --app=""file:///" & Replace(strPath, "\", "/") & "/312-poplar-cfd-analysis.html"" --start-fullscreen", 1, False
