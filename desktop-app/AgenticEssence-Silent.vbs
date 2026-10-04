Set WshShell = CreateObject("WScript.Shell")
strDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)

If CreateObject("Scripting.FileSystemObject").FileExists(strDir & "\runtime\pythonw.exe") Then
    WshShell.Run """" & strDir & "\runtime\pythonw.exe"" """ & strDir & "\launcher.py""", 0, False
ElseIf CreateObject("Scripting.FileSystemObject").FileExists(strDir & "\Launch-Agentic-Essence.bat") Then
    WshShell.Run """" & strDir & "\Launch-Agentic-Essence.bat""", 1, False
Else
    MsgBox "Could not find Agentic Essence launcher files.", 16, "Agentic Essence"
End If
