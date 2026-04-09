Set WshShell = CreateObject("WScript.Shell")
' ═══════════════════════════════════════════════════════
' BONK EXPOSED · ULTIMATE GUIDE · TRIPOD LLC
' Silent launcher — Edge app mode
' ═══════════════════════════════════════════════════════

Dim scriptDir
scriptDir = Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\"))
Dim htmlPath
htmlPath = scriptDir & "bonk_exposed.html"

WshShell.Run """msedge.exe"" --app=""file:///" & Replace(htmlPath, "\", "/") & """ --window-size=1500,940 --disable-extensions", 1, False
