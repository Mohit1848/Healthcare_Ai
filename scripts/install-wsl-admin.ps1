# Run this file from an Administrator PowerShell window.
$IsAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
  [Security.Principal.WindowsBuiltInRole]::Administrator
)

if (-not $IsAdmin) {
  throw "This script must be run from PowerShell opened with 'Run as Administrator'."
}

dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
$WslFeatureExitCode = $LASTEXITCODE
if ($WslFeatureExitCode -notin @(0, 3010)) {
  throw "Failed to enable Microsoft-Windows-Subsystem-Linux."
}

dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
$VmFeatureExitCode = $LASTEXITCODE
if ($VmFeatureExitCode -notin @(0, 3010)) {
  throw "Failed to enable VirtualMachinePlatform."
}

wsl --update
wsl --set-default-version 2

Write-Host ""
Write-Host "WSL features enabled. Restart Windows, then open Docker Desktop once before running the Kind scripts."
