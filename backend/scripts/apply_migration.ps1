#requires -Version 5.1
<#
Apply backend/sql/002_add_analysis_columns.sql to the target MySQL database.
Usage (PowerShell):
  .\apply_migration.ps1 -Host 127.0.0.1 -Port 3306 -User root -Database twinops
The script will prompt for the MySQL password (not echoed).
Note: For safety, take a backup before running:
  mysqldump -h <host> -P <port> -u <user> -p <database> analysis_reports > analysis_reports_backup.sql
#>

param(
    [string]$Host = "127.0.0.1",
    [int]$Port = 3306,
    [string]$User = "root",
    [string]$Database = "twinops"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$sqlFile = Join-Path $scriptDir "..\sql\002_add_analysis_columns.sql"
if (-not (Test-Path $sqlFile)) {
    Write-Error "SQL migration file not found: $sqlFile"
    exit 1
}

Write-Host "This will apply migration file: $sqlFile to database $Database on $Host:$Port as user $User"
$confirm = Read-Host "Proceed? (yes/no)"
if ($confirm -ne 'yes') { Write-Host "Aborted by user."; exit 1 }

# Prompt for password securely
$securePwd = Read-Host -AsSecureString "Enter MySQL password for user $User"
$ptr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePwd)
$plainPwd = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($ptr)
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)

# Run migration using mysql client. Note: password appears in process args in Windows. Consider running mysql interactively instead.
$cmd = "mysql -h $Host -P $Port -u $User -p$plainPwd $Database < `"$sqlFile`""
Write-Host "Executing: mysql -h $Host -P $Port -u $User $Database < $sqlFile"
$proc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c", $cmd -NoNewWindow -Wait -PassThru
if ($proc.ExitCode -ne 0) {
    Write-Error "Migration failed with exit code $($proc.ExitCode)"
    exit $proc.ExitCode
}
Write-Host "Migration applied successfully."
