Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")
scriptDir = FSO.GetParentFolderName(WScript.ScriptFullName)
targetUrl = "http://localhost:4173/quant-dashboard/"

' Run hidden and write logs to a readable txt file
cmd = "cmd.exe /c " & Chr(34) & Chr(34) & scriptDir & "\start-offline.bat" & Chr(34) & " --no-open > " & Chr(34) & scriptDir & "\offline-launch.txt" & Chr(34) & " 2>&1" & Chr(34)
WshShell.Run cmd, 0, False

' Give the local preview server a moment, then open app-style window
WScript.Sleep 3500

edge1 = WshShell.ExpandEnvironmentStrings("%ProgramFiles(x86)%") & "\Microsoft\Edge\Application\msedge.exe"
edge2 = WshShell.ExpandEnvironmentStrings("%ProgramFiles%") & "\Microsoft\Edge\Application\msedge.exe"
chrome1 = WshShell.ExpandEnvironmentStrings("%ProgramFiles(x86)%") & "\Google\Chrome\Application\chrome.exe"
chrome2 = WshShell.ExpandEnvironmentStrings("%ProgramFiles%") & "\Google\Chrome\Application\chrome.exe"

browserExe = ""
If FSO.FileExists(edge1) Then
  browserExe = edge1
ElseIf FSO.FileExists(edge2) Then
  browserExe = edge2
ElseIf FSO.FileExists(chrome1) Then
  browserExe = chrome1
ElseIf FSO.FileExists(chrome2) Then
  browserExe = chrome2
End If

If browserExe <> "" Then
  WshShell.Run Chr(34) & browserExe & Chr(34) & " --app=" & Chr(34) & targetUrl & Chr(34), 1, False
Else
  WshShell.Run targetUrl, 1, False
End If
