```powershell
$ErrorActionPreference = "Stop"

Write-Host "=== APEC AI Setup ===" -ForegroundColor Cyan

# === Detect Ollama and configure PATH ===
$ollamaCommand = Get-Command ollama -ErrorAction SilentlyContinue

if ($ollamaCommand) {
    $ollama = $ollamaCommand.Source
} else {
    $candidatePaths = @(
        "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe",
        "$env:ProgramFiles\Ollama\ollama.exe"
    )

    $ollama = $candidatePaths |
        Where-Object { Test-Path $_ } |
        Select-Object -First 1

    if (-not $ollama) {
        throw "Cannot find ollama.exe. Please install Ollama: https://ollama.com/download"
    }

    $ollamaDir = Split-Path $ollama -Parent

    # Add Ollama directory to persistent User PATH
    $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
    $paths = @($userPath -split ";" | Where-Object { $_ })

    $alreadyExists = $paths | Where-Object {
        $_.TrimEnd("\") -ieq $ollamaDir.TrimEnd("\")
    }

    if (-not $alreadyExists) {
        $paths += $ollamaDir
        [Environment]::SetEnvironmentVariable(
            "Path",
            ($paths -join ";"),
            "User"
        )
    }

    # Update PATH for this process immediately
    $env:Path = "$ollamaDir;$env:Path"

    Write-Host "Ollama PATH configured: $ollamaDir" -ForegroundColor Green
}

Write-Host "Ollama found: $ollama"

# Verify Ollama executable
& $ollama --version

if ($LASTEXITCODE -ne 0) {
    throw "Ollama executable failed."
}

# === Check Ollama API ===
try {
    Invoke-RestMethod `
        -Uri "http://localhost:11434/api/tags" `
        -TimeoutSec 5 |
        Out-Null
} catch {
    throw "Ollama API is not responding at localhost:11434. Please start Ollama first."
}

# === Download base model ===
Write-Host "Downloading Qwen2.5 7B..." -ForegroundColor Yellow

& $ollama pull qwen2.5:7b

if ($LASTEXITCODE -ne 0) {
    throw "Failed to download model."
}

# === Create custom model ===
Write-Host "Creating question-classifier..." -ForegroundColor Yellow

$modelfile = Join-Path $PSScriptRoot "AI-models\qwen2.5-7b\Modelfile"

if (-not (Test-Path $modelfile)) {
    throw "Modelfile not found: $modelfile"
}

& $ollama create question-classifier -f $modelfile

if ($LASTEXITCODE -ne 0) {
    throw "Failed to create model."
}


# === Download Vision-Language model ===
Write-Host "Downloading Qwen2-VL 7B Vision-Language..." -ForegroundColor Yellow

& $ollama pull qwen2-vl:7b

if ($LASTEXITCODE -ne 0) {
    throw "Failed to download Qwen2-VL 7B. Verify the model tag exists in the Ollama registry."
}

Write-Host "Qwen2-VL 7B downloaded successfully!" -ForegroundColor Green


Write-Host "AI setup completed successfully!" -ForegroundColor Green
& $ollama list
```