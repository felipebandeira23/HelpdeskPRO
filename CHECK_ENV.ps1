# ✅ VERIFICADOR DE AMBIENTE - HelpDesk PRO

$checks = @{
    "Node.js 18+" = {
        try {
            $version = node --version | Select-String -Pattern "v(\d+)" | ForEach-Object { $_.Matches.Groups[1].Value }
            [int]$version -ge 18
        } catch { $false }
    }
    "npm instalado" = {
        try { npm --version | Out-Null; $true } catch { $false }
    }
    "Git configurado" = {
        try { git --version | Out-Null; $true } catch { $false }
    }
    "Docker instalado" = {
        try { docker --version | Out-Null; $true } catch { $false }
    }
}

Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  Verificador de Ambiente - HelpDesk PRO ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════╝
" -ForegroundColor Green

$allOk = $true
$checks.GetEnumerator() | ForEach-Object {
    $ok = & $_.Value
    $symbol = if ($ok) { "✅" } else { "❌" }
    Write-Host "$symbol $($_.Key)"
    if (-not $ok) { $allOk = $false }
}

if ($allOk) {
    Write-Host "
✨ Ambiente pronto! Execute QUICK_START.txt" -ForegroundColor Green
} else {
    Write-Host "
⚠️  Instale as dependências faltantes antes de começar" -ForegroundColor Yellow
}
