Set objShell = CreateObject("WScript.Shell")
strPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
objShell.Run "msedge --app=""file:///" & Replace(strPath, "\", "/") & "/toph.html"" --start-fullscreen", 0, False
