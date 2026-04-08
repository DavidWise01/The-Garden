Set WshShell = CreateObject("WScript.Shell")
' ═══════════════════════════════════════════════════════
' COMMANDER FORGE · ULTIMATE MTG DECK BUILDER
' TriPod LLC · Fiddler
' Silent launcher — Edge app mode
' ═══════════════════════════════════════════════════════

Dim scriptDir
scriptDir = Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\"))
Dim htmlPath
htmlPath = scriptDir & "commander_forge.html"

WshShell.Run """msedge.exe"" --app=""file:///" & Replace(htmlPath, "\", "/") & """ --window-size=1500,940 --disable-extensions", 1, False
