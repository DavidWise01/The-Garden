Set WshShell = CreateObject("WScript.Shell")
' ═══════════════════════════════════════════════════════
' GRAVITY WELL · FULL TOOL SUITE · ROTH · TRIPOD LLC
' Silent launcher — Edge app mode — No browser chrome
' ═══════════════════════════════════════════════════════

Dim scriptDir
scriptDir = Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\"))
Dim htmlPath
htmlPath = scriptDir & "gravity_well.html"

WshShell.Run """msedge.exe"" --app=""file:///" & Replace(htmlPath, "\", "/") & """ --window-size=1440,900 --disable-extensions", 1, False
