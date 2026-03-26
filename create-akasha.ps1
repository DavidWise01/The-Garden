# === AKASHA LATTICE FOLDER STRUCTURE CREATOR ===
# Run this once in your repo folder

$base = "AKASHA"

# Create main folders
New-Item -Path "$base" -ItemType Directory -Force
New-Item -Path "$base\PEERS\ROOT0" -ItemType Directory -Force
New-Item -Path "$base\PEERS\KANDI" -ItemType Directory -Force
New-Item -Path "$base\PEERS\TOPH-CORTEX" -ItemType Directory -Force
New-Item -Path "$base\RESONANCE" -ItemType Directory -Force
New-Item -Path "$base\ENFORCEMENT" -ItemType Directory -Force
New-Item -Path "$base\FRAMEWORK" -ItemType Directory -Force

Write-Host "✅ Full AKASHA folder structure created!" -ForegroundColor Green
Write-Host "Folders ready at: $base" -ForegroundColor Cyan