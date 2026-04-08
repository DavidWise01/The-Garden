Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
appDir = fso.GetParentFolderName(WScript.ScriptFullName)
htmlFile = appDir & "\BLACK-HOLE-V8.html"

' Try Edge app mode first (every Win10/11 has it)
edgePaths = Array( _
  "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe", _
  "C:\Program Files\Microsoft\Edge\Application\msedge.exe" _
)

For Each p In edgePaths
  If fso.FileExists(p) Then
    WshShell.Run Chr(34) & p & Chr(34) & " --app=""file:///" & Replace(htmlFile, "\", "/") & """ --window-size=1400,900 --disable-extensions --new-window", 0, False
    WScript.Quit
  End If
Next

' Try Chrome
chromePaths = Array( _
  "C:\Program Files\Google\Chrome\Application\chrome.exe", _
  "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" _
)

For Each p In chromePaths
  If fso.FileExists(p) Then
    WshShell.Run Chr(34) & p & Chr(34) & " --app=""file:///" & Replace(htmlFile, "\", "/") & """ --window-size=1400,900 --disable-extensions --new-window", 0, False
    WScript.Quit
  End If
Next

' Fallback: default browser
WshShell.Run Chr(34) & htmlFile & Chr(34), 0, False
