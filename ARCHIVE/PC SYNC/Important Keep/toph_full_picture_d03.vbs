' TRIPOD LLC — TOPH v10.0
' FULL PICTURE // D03 // COMPLETE MAP
' Everything. One map. Nothing hidden.
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
appDir = fso.GetParentFolderName(WScript.ScriptFullName)
htmlFile = appDir & "\toph_full_picture_d03.html"
params = " --inprivate --app=""file:///" & Replace(htmlFile, "\", "/") & """ --start-fullscreen"
WshShell.Run "msedge.exe" & params, 0, False
