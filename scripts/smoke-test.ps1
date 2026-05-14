$Root = Split-Path -Parent $PSScriptRoot
$Kubectl = Join-Path $Root "tools\kubectl.exe"

if (-not (Test-Path $Kubectl)) {
  throw "Missing $Kubectl. Download kubectl to tools\kubectl.exe first."
}

& $Kubectl -n healthcare-ai get pods
& $Kubectl -n monitoring get pods
Invoke-RestMethod http://localhost:8080/api/health
Invoke-RestMethod http://localhost:8080/api/status
Invoke-RestMethod -Method Post http://localhost:8080/api/chat `
  -ContentType "application/json" `
  -Body '{"session_id":"smoke","message":"I have fever and dizziness"}'
