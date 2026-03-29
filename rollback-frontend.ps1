param(
  [switch]$WhatIf
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontendRoot = Join-Path $repoRoot 'frontend'

if (!(Test-Path $frontendRoot)) {
  throw "frontend directory not found: $frontendRoot"
}

$moveItems = @(
  '.env',
  '.eslintrc.cjs',
  'index.html',
  'package.json',
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  'tsconfig.app.json',
  'tsconfig.json',
  'tsconfig.node.json',
  'vite.config.ts',
  'vite.config.ts.timestamp-1769437585228-c3b0a1b258c118.mjs',
  'src',
  'public',
  'docs',
  'screenshots',
  'capture-screenshot.mjs',
  'check-browser-errors.html',
  'check-browser-errors.js',
  'check-errors.js',
  'check-popup-final.mjs',
  'check-popup.mjs',
  'fix-errors.js',
  'puppeteer-test.mjs',
  'simple-check.js',
  'temp_server.txt',
  'test-app.js',
  'test-console-output.mjs',
  'test-device-popup.mjs',
  'test-label-presence.mjs',
  'test-popup-visual.mjs',
  'test-popup.mjs',
  'test-scene-status.mjs',
  'test-scene.js',
  'test-scene.mjs',
  'README.md'
)

foreach ($item in $moveItems) {
  $from = Join-Path $frontendRoot $item
  $to = Join-Path $repoRoot $item
  if (Test-Path $from) {
    Move-Item -Path $from -Destination $to -Force -WhatIf:$WhatIf
  }
}

if ((Test-Path $frontendRoot) -and ((Get-ChildItem $frontendRoot -Force | Measure-Object).Count -eq 0)) {
  Remove-Item $frontendRoot -Force -WhatIf:$WhatIf
}

Write-Output 'Rollback command completed.'
