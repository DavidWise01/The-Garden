Set WshShell = CreateObject("WScript.Shell")
Dim scriptDir
scriptDir = Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\"))
Dim htmlPath
htmlPath = scriptDir & "jaclyn_david_ink.html"
WshShell.Run """msedge.exe"" --app=""file:///" & Replace(htmlPath, "\", "/") & """ --window-size=1500,940 --disable-extensions", 1, False
