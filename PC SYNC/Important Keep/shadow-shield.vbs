Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")
strDir = objFSO.GetParentFolderName(WScript.ScriptFullName)
strHTML = strDir & "\shadow-shield.html"
strEdge = ""
arrPaths = Array( _
    objShell.ExpandEnvironmentStrings("%ProgramFiles(x86)%") & "\Microsoft\Edge\Application\msedge.exe", _
    objShell.ExpandEnvironmentStrings("%ProgramFiles%") & "\Microsoft\Edge\Application\msedge.exe", _
    objShell.ExpandEnvironmentStrings("%LocalAppData%") & "\Microsoft\Edge\Application\msedge.exe" _
)
For Each p In arrPaths
    If objFSO.FileExists(p) Then
        strEdge = p
        Exit For
    End If
Next
If strEdge = "" Then
    MsgBox "Microsoft Edge not found.", vbCritical, "TOPH v9.0 · SHADOW SHIELD"
    WScript.Quit
End If
If Not objFSO.FileExists(strHTML) Then
    MsgBox "shadow-shield.html not found in:" & vbCrLf & strDir, vbCritical, "TOPH v9.0"
    WScript.Quit
End If
objShell.Run """" & strEdge & """ --app=""file:///" & Replace(strHTML, "\", "/") & """ --window-size=1500,950", 0, False
