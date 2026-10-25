
$ErrorActionPreference = "Stop"

Write-Host "=== APEC AI Setup ==="

# Check Ollama installation
$ollamaCommand = Get-Command ollama -ErrorAction SilentlyContinue

if ($ollamaCommand) {
    $ollama = $ollamaCommand.Source
} else {
    $defaultPath = "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe"

    if (Test-Path $defaultPath) {
        $ollama = $defaultPath
    } else {
        throw "Cannot find ollama.exe. Please check the installation path."
    }
}

Write-Host "Ollama found: $ollama"

# Check Ollama server
try {
    Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -TimeoutSec 5 |
        Out-Null
} catch {
    throw "Ollama API is not responding at localhost:11434."
}


# Download base model
Write-Host "Downloading Qwen2.5 7B..."
& $ollama pull qwen2.5:7b

if ($LASTEXITCODE -ne 0) {
    throw "Failed to download model."
}

# Create custom model
Write-Host "Creating question-classifier..."

$modelfile = Join-Path $PSScriptRoot "AI-models\qwen2.5-7b\Modelfile"

& $ollama create question-classifier -f $modelfile

if ($LASTEXITCODE -ne 0) {
    throw "Failed to create model."
}


Write-Host "AI setup completed successfully!"
& $ollama list
