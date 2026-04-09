Set objShell = CreateObject("WScript.Shell")
strPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
objShell.Run "msedge --app=""file:///" & Replace(strPath, "\", "/") & "/fusion-engine.html"" --start-fullscreen", 0, False
