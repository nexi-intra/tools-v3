# run.ps1 - Script to execute the GitHub Action

param (
    [Parameter(Mandatory)]
    [string]$Input
)

# Your action logic here
Write-Host "Running GitHub Action: sdfd with input: $Input"
