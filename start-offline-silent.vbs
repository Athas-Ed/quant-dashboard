Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")
scriptDir = FSO.GetParentFolderName(WScript.ScriptFullName)
targetUrl = "http://localhost:4173/quant-dashboard/"
windowWidth = 600
windowHeight = 700

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
  psCmd = "$ErrorActionPreference='SilentlyContinue'; Add-Type -AssemblyName System.Windows.Forms; " & _
          "$wa=[System.Windows.Forms.Screen]::PrimaryScreen.WorkingArea; " & _
          "$w=" & windowWidth & "; $h=" & windowHeight & "; " & _
          "$x=[Math]::Max(0,[int](($wa.Width-$w)/2)); $y=[Math]::Max(0,[int](($wa.Height-$h)/2)); " & _
          "Start-Process -FilePath '" & Replace(browserExe, "'", "''") & "' -ArgumentList @('--app=" & targetUrl & "', '--window-size=" & windowWidth & "," & windowHeight & "', ('--window-position=' + $x + ',' + $y))"
  WshShell.Run "powershell -NoProfile -WindowStyle Hidden -Command " & Chr(34) & psCmd & Chr(34), 0, False
Else
  WshShell.Run targetUrl, 1, False
End If
