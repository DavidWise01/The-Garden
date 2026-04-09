Dim sDir, sFile
sDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
sFile = sDir & "\312-poplar-property-report.html"
If Not CreateObject("Scripting.FileSystemObject").FileExists(sFile) Then
    MsgBox "312-poplar-property-report.html not found.", vbExclamation, "TRIPOD LLC"
    WScript.Quit
End If
CreateObject("WScript.Shell").Run "msedge.exe --app=""file:///" & Replace(sFile, "\", "/") & """ --start-fullscreen", 1, False
