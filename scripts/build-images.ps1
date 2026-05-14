$Root = Split-Path -Parent $PSScriptRoot
$Kind = Join-Path $Root "tools\kind.exe"
$DockerBin = "C:\Program Files\Docker\Docker\resources\bin"
$Docker = Join-Path $DockerBin "docker.exe"

if (-not (Test-Path $Kind)) {
  throw "Missing $Kind. Download Kind to tools\kind.exe first."
}

if (Test-Path $Docker) {
  $env:Path = "$DockerBin;$env:Path"
} else {
  $Docker = "docker"
}

& $Docker build -t healthcare-ai/backend:local (Join-Path $Root "backend")
& $Docker build -t healthcare-ai/vector-service:local (Join-Path $Root "vector-service")
& $Docker build -t healthcare-ai/frontend:local (Join-Path $Root "frontend")
& $Kind load docker-image healthcare-ai/backend:local --name healthcare-ai
& $Kind load docker-image healthcare-ai/vector-service:local --name healthcare-ai
& $Kind load docker-image healthcare-ai/frontend:local --name healthcare-ai
