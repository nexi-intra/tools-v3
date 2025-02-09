<#
.SYNOPSIS
    Interactive wizard to provision a new GitHub Action.

.DESCRIPTION
    This script prompts the user for the action name and connections,
    then creates the necessary YAML configuration and folder structure
    with run.ps1 and debug.ps1 scripts.

.PARAMETER root
    The root directory of the GitHub repository.

.EXAMPLE
    .\Provision-GitHubAction.ps1 -root "C:\Path\To\Repo"
#>

# param (
#     [Parameter(Mandatory = $true)]
#     [string]$root 
# )
$root = join-path $PSScriptRoot "new"
if (!(Test-Path -Path $root)) {
    New-Item -Path $root -ItemType Directory -Force | Out-Null
}
# Function to display an error and exit
function Throw-Error {
    param (
        [string]$message
    )
    Write-Error $message
    exit 1
}

# Validate the root directory
if (-not (Test-Path -Path $root -PathType Container)) {
    Throw-Error "The specified root directory does not exist: $root"
}

# Change to the root directory
Set-Location -Path $root

# Prompt for the name of the action
$actionName = Read-Host "Enter the name of the GitHub Action"
if ([string]::IsNullOrWhiteSpace($actionName)) {
    Throw-Error "Action name cannot be empty."
}

# Define available connections (customize as needed)
$availableConnections = @(
    "Exchange",
    "Azure",
    "SharePoint",
    "Office Graph",
    "Custom Service"
)

# Prompt for connections
Write-Host "Select the connections to establish (use space to select multiple):"
# Function to display connections and get user selection
function Get-ConnectionSelection {
    param (
        [string[]]$options
    )

    Write-Host "Select the connections to establish (enter numbers separated by commas):"
    for ($i = 0; $i -lt $options.Count; $i++) {
        Write-Host "$($i + 1). $($options[$i])"
    }

    $selection = Read-Host "Enter your choices (e.g., 1,3,5)"
    if ([string]::IsNullOrWhiteSpace($selection)) {
        Throw-Error "At least one connection must be selected."
    }

    # Parse the input
    $selectedIndices = $selection -split "," | ForEach-Object {
        $_.Trim() -as [int]
    }

    # Validate selections
    if ($selectedIndices -contains $null) {
        Throw-Error "Invalid input. Please enter numbers separated by commas."
    }

    $selectedConnections = @()
    foreach ($index in $selectedIndices) {
        if ($index -lt 1 -or $index -gt $options.Count) {
            Throw-Error "Selection out of range: $index"
        }
        $selectedConnections += $options[$index - 1]
    }

    return $selectedConnections
}

# Get user-selected connections
$connections = Get-ConnectionSelection -options $availableConnections


if (-not $connections) {
    Throw-Error "At least one connection must be selected."
}

# Define paths
$actionsDir = Join-Path -Path $root -ChildPath ".github\actions"
if (-not (Test-Path -Path $actionsDir)) {
    New-Item -Path $actionsDir -ItemType Directory -Force | Out-Null
}

$actionFolder = Join-Path -Path $actionsDir -ChildPath $actionName
if (Test-Path -Path $actionFolder) {
    Throw-Error "Action folder already exists: $actionFolder"
}
else {
    New-Item -Path $actionFolder -ItemType Directory -Force | Out-Null
}

# Create run.ps1 (template content, customize as needed)
$runPs1Content = @"
# run.ps1 - Script to execute the GitHub Action

param (
    [Parameter(Mandatory)]
    [string]`$Input
)

# Your action logic here
Write-Host "Running GitHub Action: $actionName with input: `$Input"
"@

$runPs1Path = Join-Path -Path $actionFolder -ChildPath "run.ps1"
Set-Content -Path $runPs1Path -Value $runPs1Content -Encoding UTF8

# Create debug.ps1 with provided content
$debugPs1Content = @"
Push-Location
try {
  Set-Location `$PSScriptRoot
  . "`$PSScriptRoot/../.koksmat/pwsh/build-env.ps1"
  . "`$PSScriptRoot/temp.ps1"
  . "`$PSScriptRoot/run.ps1"
}
catch {
  write-host "Error: $_" -ForegroundColor:Red
  <#Do this if a terminating exception happens#>
}
finally {
  Pop-Location
}
"@

$debugPs1Path = Join-Path -Path $actionFolder -ChildPath "debug.ps1"
Set-Content -Path $debugPs1Path -Value $debugPs1Content -Encoding UTF8

# Create the GitHub Action YAML file
$yamlDir = Join-Path -Path $root -ChildPath ".github\workflows"
if (-not (Test-Path -Path $yamlDir)) {
    New-Item -Path $yamlDir -ItemType Directory -Force | Out-Null
}

$yamlFileName = "$actionName.yml"
$yamlFilePath = Join-Path -Path $yamlDir -ChildPath $yamlFileName

# Generate connections steps (customize based on actual connections)
$connectionSteps = ""
# foreach ($conn in $connections) {
#     switch ($conn) {
#         "GitHub API" { $connectionSteps += "      - name: Connect to GitHub API`n        uses: actions/github-script@v6`n        with:`n          script: |`n            // Your GitHub API connection code here`n" }
#         "Azure" { $connectionSteps += "      - name: Connect to Azure`n        uses: azure/login@v1`n        with:`n          creds: \${{ secrets.AZURE_CREDENTIALS }}\n" }
#         "AWS" { $connectionSteps += "      - name: Configure AWS Credentials`n        uses: aws-actions/configure-aws-credentials@v1`n        with:`n          aws-access-key-id: \${{ secrets.AWS_ACCESS_KEY_ID }}\n          aws-secret-access-key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}\n          aws-region: us-east-1\n" }
#         "Docker" { $connectionSteps += "      - name: Set up Docker Buildx`n        uses: docker/setup-buildx-action@v2\n" }
#         "Slack" { $connectionSteps += "      - name: Send notification to Slack`n        uses: slackapi/slack-github-action@v1`n        with:`n          slack-message: 'GitHub Action $actionName started.'\n          slack-webhook-url: \${{ secrets.SLACK_WEBHOOK_URL }}\n" }
#         "Jira" { $connectionSteps += "      - name: Connect to Jira`n        uses: atlassian/gajira-action@v2`n        with:`n          jira_url: \${{ secrets.JIRA_URL }}\n          jira_user: \${{ secrets.JIRA_USER }}\n          jira_api_token: \${{ secrets.JIRA_API_TOKEN }}\n" }
#         "Custom Service" { $connectionSteps += "      - name: Connect to Custom Service`n        run: |`n          # Add your custom service connection commands here`n" }
#         default { }
#     }
# }

# YAML Template
$yamlContent = @"
name: $actionName

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

$connectionSteps
      - name: Execute Action
        uses: ./.github/actions/$actionName
        with:
          Input: "Sample input"
"@

Set-Content -Path $yamlFilePath -Value $yamlContent -Encoding UTF8

# Confirmation Message
Write-Host "GitHub Action '$actionName' has been successfully created." -ForegroundColor Green
Write-Host "YAML file: $yamlFilePath" -ForegroundColor Green
Write-Host "Action scripts are located in: $actionFolder" -ForegroundColor Green
