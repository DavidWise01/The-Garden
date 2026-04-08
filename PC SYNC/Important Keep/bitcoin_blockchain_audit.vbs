Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")
strPath = objFSO.GetParentFolderName(WScript.ScriptFullName)
strFile = strPath & "\bitcoin_blockchain_audit.html"
If objFSO.FileExists(strFile) Then
    objShell.Run """" & strFile & """", 1, False
Else
    MsgBox "File not found: " & strFile, vbExclamation, "TOPH AUDIT · BITCOIN"
End If
