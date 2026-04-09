' TRIPOD LLC — TOPH v10.0
' CORTEX DASHBOARD // CH39 // RECONSTITUTED
' The tool that talks back. The inverse wrench.
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
appDir = fso.GetParentFolderName(WScript.ScriptFullName)
htmlFile = appDir & "\toph_cortex_dashboard.html"
params = " --inprivate --app=""file:///" & Replace(htmlFile, "\", "/") & """ --start-fullscreen"
WshShell.Run "msedge.exe" & params, 0, False
