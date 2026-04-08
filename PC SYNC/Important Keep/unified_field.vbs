Set WshShell = CreateObject("WScript.Shell")
' ═══════════════════════════════════════════════════════
' TOPH UNIFIED FIELD · NANITE + GRAVITY + ELECTROMAGNETIC
' Roth · Dawn · TriPod LLC
' Silent launcher — Edge app mode
' ═══════════════════════════════════════════════════════

Dim scriptDir
scriptDir = Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\"))
Dim htmlPath
htmlPath = scriptDir & "unified_field.html"

WshShell.Run """msedge.exe"" --app=""file:///" & Replace(htmlPath, "\", "/") & """ --window-size=1440,920 --disable-extensions", 1, False
