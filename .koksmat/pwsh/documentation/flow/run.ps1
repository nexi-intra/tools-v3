# Filename: Convert-GitHubActionsToMermaid.ps1

<#
.SYNOPSIS
    Converts GitHub Actions workflows into Mermaid flowcharts.

.DESCRIPTION
    This script parses YAML workflow files in the .github/workflows directory
    and generates Mermaid.js flowchart syntax to visualize job dependencies.

.NOTES
    Requires PowerShell 7 or later.
#>

# Function to get all YAML workflow files
function Get-WorkflowFiles {
  $rootDir = Resolve-Path (join-path $PSScriptRoot ".." ".." ".." "..")
  $workflowDir = "$rootDir/.github/workflows"
  if (-Not (Test-Path $workflowDir)) {
    Write-Error "Workflow directory '$workflowDir' does not exist."
    exit 1
  }
  Get-ChildItem -Path $workflowDir -Filter *.yml -Recurse
}

# Function to parse a single workflow file
function Parse-WorkflowFile($filePath) {
  try {
    $yamlContent = Get-Content -Path $filePath -Raw
    $workflow = $yamlContent | ConvertFrom-Yaml
    return $workflow
  }
  catch {
    Write-Warning "Failed to parse YAML file: $filePath"
    return $null
  }
}

# Function to generate Mermaid syntax from workflows
function Generate-Mermaid($workflows) {
  $mermaid = @("graph TD")
  foreach ($workflow in $workflows) {
    if ($null -eq $workflow.jobs) { continue }

    foreach ($jobName in $workflow.jobs.PSObject.Properties.Name) {
      $job = $workflow.jobs.$jobName
      if ($job.needs) {
        # 'needs' can be a single string or an array
        if ($job.needs -is [System.Array]) {
          foreach ($need in $job.needs) {
            $mermaid += "    $need --> $jobName"
          }
        }
        else {
          $mermaid += "    $job.needs --> $jobName"
        }
      }
      else {
        # If no dependencies, you can represent it as a starting point
        $mermaid += "    Start --> $jobName"
      }
    }
  }

  # Optional: Define a start node if there are multiple starting jobs
  if ($mermaid -notcontains "    Start") {
    $mermaid = @("graph TD")
    foreach ($workflow in $workflows) {
      if ($null -eq $workflow.jobs) { continue }

      foreach ($jobName in $workflow.jobs.PSObject.Properties.Name) {
        $job = $workflow.jobs.$jobName
        if ($job.needs) {
          # 'needs' can be a single string or an array
          if ($job.needs -is [System.Array]) {
            foreach ($need in $job.needs) {
              $mermaid += "    $need --> $jobName"
            }
          }
          else {
            $mermaid += "    $job.needs --> $jobName"
          }
        }
        else {
          # If no dependencies, represent it as a starting point
          $mermaid += "    Start --> $jobName"
        }
      }
    }
  }

  return $mermaid -join "`n"
}

# Main script execution
$workflowFiles = Get-WorkflowFiles
if ($workflowFiles.Count -eq 0) {
  Write-Error "No workflow YAML files found in .github/workflows/"
  exit 1
}

$parsedWorkflows = @()
foreach ($file in $workflowFiles) {
  $workflow = Parse-WorkflowFile -filePath $file.FullName
  if ($null -ne $workflow) {
    $parsedWorkflows += $workflow
  }
}

if ($parsedWorkflows.Count -eq 0) {
  Write-Error "No valid workflows parsed."
  exit 1
}

$mermaidSyntax = Generate-Mermaid -workflows $parsedWorkflows

# Output the Mermaid syntax to a file
$outputFile = "github-actions-flowchart.mmd"
$mermaidSyntax | Out-File -FilePath $outputFile -Encoding UTF8

Write-Output "Mermaid flowchart generated successfully: $outputFile"
