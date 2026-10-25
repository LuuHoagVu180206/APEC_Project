
$ErrorActionPreference = "Stop"

Write-Host "=== APEC AI Setup ==="

# Check Ollama installation
if (-not (Get-Command ollama -ErrorAction SilentlyContinue)) {
    Write-Host "Ollama is not installed."
    Write-Host "Download: https://ollama.com/download"
    exit 1
}

# Check Ollama server
try {
    Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -TimeoutSec 5 | Out-Null
} catch {
    Write-Host "Please start the Ollama application first."
    exit 1
}

# Download base model
Write-Host "Downloading Qwen2.5 7B..."
ollama pull qwen2.5:7b

if ($LASTEXITCODE -ne 0) {
    throw "Failed to download model."
}

# Create custom model
Write-Host "Creating question-classifier..."

$modelfile = Join-Path $PSScriptRoot "AI-models\qwen2.5-7b\Modelfile"

ollama create question-classifier -f $modelfile

if ($LASTEXITCODE -ne 0) {
    throw "Failed to create model."
}

Write-Host "AI setup completed successfully!"
ollama list
