param(
  [string]$DocsPath = ".\data\medical-pdfs"
)

if (-not (Test-Path $DocsPath)) {
  throw "Create $DocsPath and add WHO, CDC, first-aid, or emergency symptom PDFs."
}

$Root = Split-Path -Parent $PSScriptRoot
$Kubectl = Join-Path $Root "tools\kubectl.exe"

if (-not (Test-Path $Kubectl)) {
  throw "Missing $Kubectl. Download kubectl to tools\kubectl.exe first."
}

$pod = & $Kubectl -n healthcare-ai get pod -l app=vector-service -o jsonpath="{.items[0].metadata.name}"
& $Kubectl -n healthcare-ai cp $DocsPath ${pod}:/docs
& $Kubectl -n healthcare-ai exec $pod -- python -m app.ingest
& $Kubectl -n healthcare-ai rollout restart deployment/backend
