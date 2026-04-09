Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Get script directory
strDir = objFSO.GetParentFolderName(WScript.ScriptFullName)
strDashboard = strDir & "\toph-dashboard.html"

' Find Edge
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
    MsgBox "Microsoft Edge not found. Install Edge or update paths.", vbCritical, "TOPH v9.0"
    WScript.Quit
End If

If Not objFSO.FileExists(strDashboard) Then
    MsgBox "toph-dashboard.html not found in:" & vbCrLf & strDir, vbCritical, "TOPH v9.0"
    WScript.Quit
End If

' Launch Edge in app mode - no address bar, no tabs, clean window
objShell.Run """" & strEdge & """ --app=""file:///" & Replace(strDashboard, "\", "/") & """ --window-size=1400,900", 0, False

Set objShell = Nothing
Set objFSO = Nothing
