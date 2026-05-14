param(
  [string]$OpenAiApiKey = $env:OPENAI_API_KEY,
  [string]$GroqApiKey = $env:GROQ_API_KEY
)

if (-not $OpenAiApiKey) {
  throw "Set OPENAI_API_KEY or pass -OpenAiApiKey."
}

$Root = Split-Path -Parent $PSScriptRoot
$Kubectl = Join-Path $Root "tools\kubectl.exe"

if (-not (Test-Path $Kubectl)) {
  throw "Missing $Kubectl. Download kubectl to tools\kubectl.exe first."
}

& $Kubectl apply -f (Join-Path $Root "k8s\base\namespace.yaml")

$SecretArgs = @(
  "-n", "healthcare-ai",
  "create", "secret", "generic", "openai-secret",
  "--from-literal=OPENAI_API_KEY=$OpenAiApiKey"
)
if ($GroqApiKey) {
  $SecretArgs += "--from-literal=GROQ_API_KEY=$GroqApiKey"
}
$SecretArgs += @("--dry-run=client", "-o", "yaml")
& $Kubectl @SecretArgs | & $Kubectl apply -f -
& $Kubectl apply -k (Join-Path $Root "k8s\base")
& $Kubectl apply -k (Join-Path $Root "monitoring")
& $Kubectl -n healthcare-ai rollout status deployment/mongodb
& $Kubectl -n healthcare-ai rollout status deployment/vector-service
& $Kubectl -n healthcare-ai rollout status deployment/backend
& $Kubectl -n healthcare-ai rollout status deployment/frontend
& $Kubectl -n monitoring rollout status deployment/prometheus
& $Kubectl -n monitoring rollout status deployment/grafana
