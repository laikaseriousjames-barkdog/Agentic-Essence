!include "MUI2.nsh"
!include "FileFunc.nsh"

; General Configuration
Name "Agentic Essence Desktop"
OutFile "../downloads/Agentic-Essence-Desktop-Setup.exe"
Unicode True
RequestExecutionLevel user

; Default Installation Directory (Per-User LocalAppData - No Admin / UAC Required)
InstallDir "$LOCALAPPDATA\Programs\Agentic Essence"
InstallDirRegKey HKCU "Software\Agentic Essence" "Install_Dir"

; Solid LZMA Compression for minimal footprint
SetCompressor /SOLID lzma

; Interface Branding
!define MUI_ABORTWARNING
!define MUI_ICON "icon.ico"
!define MUI_UNICON "icon.ico"

; Wizard Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES

; Finish Page with Launch Option
!define MUI_FINISHPAGE_RUN "$INSTDIR\runtime\pythonw.exe"
!define MUI_FINISHPAGE_RUN_PARAMETERS "$\"$INSTDIR\launcher.py$\""
!define MUI_FINISHPAGE_RUN_TEXT "Launch Agentic Essence Cyberdeck"
!insertmacro MUI_PAGE_FINISH

; Uninstaller Pages
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

; Language
!insertmacro MUI_LANGUAGE "English"

; Installer Section
Section "Agentic Essence Core" SecCore
    SetOutPath "$INSTDIR"
    
    ; Core Launcher & Server Scripts
    File "launcher.py"
    File "desktop_server.py"
    File "main.py"
    File "Launch-Agentic-Essence.bat"
    File "AgenticEssence-Silent.vbs"
    File "icon.ico"

    ; Cyberdeck Web Assets
    SetOutPath "$INSTDIR\src\www"
    File /r "src\www\*.*"

    ; Python Embed Standalone Runtime
    SetOutPath "$INSTDIR\runtime"
    File /r "runtime\*.*"

    ; Reset working directory to installation root
    SetOutPath "$INSTDIR"

    ; Create Uninstaller
    WriteUninstaller "$INSTDIR\Uninstall.exe"

    ; Desktop & Start Menu Shortcuts
    CreateDirectory "$SMPROGRAMS\Agentic Essence"
    CreateShortcut "$SMPROGRAMS\Agentic Essence\Agentic Essence Cyberdeck.lnk" "$INSTDIR\runtime\pythonw.exe" '"$INSTDIR\launcher.py"' "$INSTDIR\icon.ico" 0
    CreateShortcut "$SMPROGRAMS\Agentic Essence\Agentic Essence (Debug Console).lnk" "$INSTDIR\runtime\python.exe" '"$INSTDIR\launcher.py"' "$INSTDIR\icon.ico" 0
    CreateShortcut "$SMPROGRAMS\Agentic Essence\Uninstall Agentic Essence.lnk" "$INSTDIR\Uninstall.exe" "" "$INSTDIR\icon.ico" 0
    CreateShortcut "$DESKTOP\Agentic Essence.lnk" "$INSTDIR\runtime\pythonw.exe" '"$INSTDIR\launcher.py"' "$INSTDIR\icon.ico" 0

    ; Windows Registry Registration (Add/Remove Programs)
    WriteRegStr HKCU "Software\Agentic Essence" "Install_Dir" "$INSTDIR"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\AgenticEssence" "DisplayName" "Agentic Essence — Autonomous AI Cyberdeck"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\AgenticEssence" "UninstallString" '"$INSTDIR\Uninstall.exe"'
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\AgenticEssence" "DisplayIcon" "$INSTDIR\icon.ico"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\AgenticEssence" "DisplayVersion" "3.0.0"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\AgenticEssence" "Publisher" "Agentic Essence"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\AgenticEssence" "HelpLink" "https://agentic-essence.com/"
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\AgenticEssence" "URLInfoAbout" "https://agentic-essence.com/"
    WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\AgenticEssence" "NoModify" 1
    WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\AgenticEssence" "NoRepair" 1
SectionEnd

; Uninstaller Section
Section "Uninstall"
    ; Remove Shortcuts
    Delete "$DESKTOP\Agentic Essence.lnk"
    Delete "$SMPROGRAMS\Agentic Essence\Agentic Essence Cyberdeck.lnk"
    Delete "$SMPROGRAMS\Agentic Essence\Agentic Essence (Debug Console).lnk"
    Delete "$SMPROGRAMS\Agentic Essence\Uninstall Agentic Essence.lnk"
    RMDir "$SMPROGRAMS\Agentic Essence"

    ; Clean Files
    RMDir /r "$INSTDIR\src"
    RMDir /r "$INSTDIR\runtime"
    Delete "$INSTDIR\launcher.py"
    Delete "$INSTDIR\desktop_server.py"
    Delete "$INSTDIR\main.py"
    Delete "$INSTDIR\Launch-Agentic-Essence.bat"
    Delete "$INSTDIR\AgenticEssence-Silent.vbs"
    Delete "$INSTDIR\icon.ico"
    Delete "$INSTDIR\Uninstall.exe"
    RMDir "$INSTDIR"

    ; Clean Registry
    DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\AgenticEssence"
    DeleteRegKey HKCU "Software\Agentic Essence"
SectionEnd
