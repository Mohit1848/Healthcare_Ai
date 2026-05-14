$Root = Split-Path -Parent $PSScriptRoot
$Kind = Join-Path $Root "tools\kind.exe"
$Kubectl = Join-Path $Root "tools\kubectl.exe"
$DockerBin = "C:\Program Files\Docker\Docker\resources\bin"

if (-not (Test-Path $Kind)) {
  throw "Missing $Kind. Download Kind to tools\kind.exe first."
}

if (-not (Test-Path $Kubectl)) {
  throw "Missing $Kubectl. Download kubectl to tools\kubectl.exe first."
}

if (Test-Path (Join-Path $DockerBin "docker.exe")) {
  $env:Path = "$DockerBin;$env:Path"
}

& $Kind create cluster --config (Join-Path $Root "infra\kind\cluster.yaml")
& $Kubectl cluster-info --context kind-healthcare-ai
