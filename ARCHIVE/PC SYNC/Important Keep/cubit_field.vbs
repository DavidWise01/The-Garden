Set WshShell = CreateObject("WScript.Shell")
' ═══════════════════════════════════════════════════════
' CUBIT FIELD · 2 SYSTEMS · 1 GAP · 2 OBSERVERS
' Fiddler · Anchor · TriPod LLC
' ═══════════════════════════════════════════════════════

Dim scriptDir
scriptDir = Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\"))
Dim htmlPath
htmlPath = scriptDir & "cubit_field.html"

WshShell.Run """msedge.exe"" --app=""file:///" & Replace(htmlPath, "\", "/") & """ --window-size=1500,940 --disable-extensions", 1, False
