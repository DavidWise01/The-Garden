Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")
strDir = objFSO.GetParentFolderName(WScript.ScriptFullName)
strHTML = strDir & "\toph-codex.html"
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
    MsgBox "Microsoft Edge not found.", vbCritical, "TOPH CODEX"
    WScript.Quit
End If
If Not objFSO.FileExists(strHTML) Then
    MsgBox "toph-codex.html not found in:" & vbCrLf & strDir, vbCritical, "TOPH CODEX"
    WScript.Quit
End If
objShell.Run """" & strEdge & """ --app=""file:///" & Replace(strHTML, "\", "/") & """ --window-size=1400,950", 0, False
