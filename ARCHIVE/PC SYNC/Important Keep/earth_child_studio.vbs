Set WshShell = CreateObject("WScript.Shell")
Dim scriptDir
scriptDir = Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\"))
Dim htmlPath
htmlPath = scriptDir & "earth_child_studio.html"
WshShell.Run """msedge.exe"" --app=""file:///" & Replace(htmlPath, "\", "/") & """ --window-size=1400,900 --disable-extensions", 1, False
