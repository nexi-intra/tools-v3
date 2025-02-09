# run.ps1 - Script to execute the GitHub Action

param (
    [Parameter(Mandatory)]
    [string]$Input
)

# Your action logic here
Write-Host "Running GitHub Action: s1 with input: $Input"
