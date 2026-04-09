Set WshShell = CreateObject("WScript.Shell")
' ═══════════════════════════════════════════════════════
' NANITE FACTORY · PLATFORM BUILDER · ROTH · TRIPOD LLC
' Silent launcher — Edge app mode
' ═══════════════════════════════════════════════════════

Dim scriptDir
scriptDir = Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\"))
Dim htmlPath
htmlPath = scriptDir & "nanite_factory.html"

WshShell.Run """msedge.exe"" --app=""file:///" & Replace(htmlPath, "\", "/") & """ --window-size=1440,920 --disable-extensions", 1, False
