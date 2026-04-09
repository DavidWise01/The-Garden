Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
appDir = fso.GetParentFolderName(WScript.ScriptFullName)
htmlFile = appDir & "\D20-TATTOO-FLASH.html"
edgePaths = Array("C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe","C:\Program Files\Microsoft\Edge\Application\msedge.exe")
For Each p In edgePaths
  If fso.FileExists(p) Then
    WshShell.Run Chr(34) & p & Chr(34) & " --app=""file:///" & Replace(htmlFile, "\", "/") & """ --window-size=1200,900 --disable-extensions --new-window", 0, False
    WScript.Quit
  End If
Next
WshShell.Run Chr(34) & htmlFile & Chr(34), 0, False
