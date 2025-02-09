# Define the output directory
$docsDir = Join-Path $env:workdir 'docs'

# Ensure the docs directory exists; create it if it doesn't
if (-not (Test-Path -Path $docsDir)) {
  try {
    New-Item -Path $docsDir -ItemType Directory -Force | Out-Null
    Write-Verbose "Created directory: $docsDir"
  }
  catch {
    Write-Error "Failed to create directory $docsDir. $_"
    exit 1
  }
}

# Retrieve all run.ps1 files recursively from the current directory
try {
  $runScripts = Get-ChildItem -Path . -Recurse -Filter 'run.ps1' -File
  Write-Verbose "Found $($runScripts.Count) run.ps1 files."
}
catch {
  Write-Error "Error while searching for run.ps1 files. $_"
  exit 1
}

# Define a variable for triple backticks to avoid issues
$tripleBackticks = '```'

# Function to parse run.ps1 content into code and markdown segments
function Parse-RunScriptContent {
  param (
    [string]$Content
  )

  # Initialize an array to hold the segments
  $segments = @()

  # Define regex patterns
  $markdownStartPattern = '<#'
  $markdownEndPattern = '#>'

  # Initialize state variables
  $currentIndex = 0
  $isMarkdown = $false

  while ($currentIndex -lt $Content.Length) {
    if (-not $isMarkdown) {
      # Look for the start of a markdown block
      $start = $Content.IndexOf($markdownStartPattern, $currentIndex)
      if ($start -eq -1) {
        # No more markdown blocks; add the rest as code
        $segments += [PSCustomObject]@{ Type = 'Code'; Content = $Content.Substring($currentIndex) }
        break
      }
      else {
        if ($start -gt $currentIndex) {
          # Add code before the markdown block
          $codeSegment = $Content.Substring($currentIndex, $start - $currentIndex)
          $segments += [PSCustomObject]@{ Type = 'Code'; Content = $codeSegment }
        }
        # Update currentIndex to after the start marker
        $currentIndex = $start + $markdownStartPattern.Length
        $isMarkdown = $true
      }
    }
    else {
      # Look for the end of the markdown block
      $end = $Content.IndexOf($markdownEndPattern, $currentIndex)
      if ($end -eq -1) {
        # No end marker found; treat the rest as markdown
        $markdownSegment = $Content.Substring($currentIndex)
        $segments += [PSCustomObject]@{ Type = 'Markdown'; Content = $markdownSegment }
        break
      }
      else {
        # Extract markdown content
        $markdownSegment = $Content.Substring($currentIndex, $end - $currentIndex)
        $segments += [PSCustomObject]@{ Type = 'Markdown'; Content = $markdownSegment }
        # Update currentIndex to after the end marker
        $currentIndex = $end + $markdownEndPattern.Length
        $isMarkdown = $false
      }
    }
  }

  return $segments
}

# Process each run.ps1 file to create an individual Markdown file
foreach ($script in $runScripts) {
  # Get the directory of the run.ps1 file
  $fileDir = $script.Directory

  # Compute the relative path from the current directory to the file's directory
  $currentPath = (Get-Location).Path
  $fullFilePath = $fileDir.FullName

  # Handle different path formats (Windows vs. Unix)
  $relativePath = $fullFilePath.Substring($currentPath.Length).TrimStart('\', '/')

  # Calculate the entry name
  if ([string]::IsNullOrEmpty($relativePath)) {
    # If run.ps1 is in the current directory
    $calculatedName = 'run'
  }
  else {
    # Replace backslashes or forward slashes with dashes and append '-run'
    $calculatedName = ($relativePath -replace '[\\/]', '-') + '-run'
  }

  # Define the Markdown file name
  $markdownFileName = "$calculatedName.md"

  # Define the relative directory for the markdown file within docs
  $markdownRelativeDir = if ([string]::IsNullOrEmpty($relativePath)) {
    ''
  }
  else {
    $relativePath -replace '[\\/]', '\'
  }

  # Create the full path for the markdown file's directory
  $markdownFullDir = if ([string]::IsNullOrEmpty($markdownRelativeDir)) {
    $docsDir
  }
  else {
    Join-Path $docsDir $markdownRelativeDir
  }

  # Ensure the directory exists
  if (-not (Test-Path -Path $markdownFullDir)) {
    try {
      New-Item -Path $markdownFullDir -ItemType Directory -Force | Out-Null
      Write-Verbose "Created directory: $markdownFullDir"
    }
    catch {
      Write-Error "Failed to create directory $markdownFullDir. $_"
      continue
    }
  }

  # Define the full Markdown file path within the subdirectory
  $markdownFilePath = Join-Path $markdownFullDir $markdownFileName

  # Read the content of the run.ps1 file
  try {
    $scriptContent = Get-Content -Path $script.FullName -Raw
  }
  catch {
    Write-Error "Failed to read file $($script.FullName). $_"
    continue
  }

  # Extract metadata for front matter
  # Title: Calculated name
  $title = $calculatedName

  # Date: Last write time of the run.ps1 file in ISO 8601 format
  $date = $script.LastWriteTime.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")

  # Description: Extract the first comment line or set a default description
  $description = ""
  $firstLine = $scriptContent -split "`n" | Select-Object -First 1
  if ($firstLine -match '^#\s*(.+)') {
    $description = $matches[1].Trim()
  }
  else {
    $description = "Description for $calculatedName."
  }

  # Tags: Default tags or based on directory structure
  $tags = @("run", "script")
  if ($relativePath) {
    $pathParts = $relativePath -split '[\\/]'
    $tags += $pathParts
  }

  # Author: Attempt to extract from script comments or set to 'Unknown'
  $author = "Unknown"
  $authorLine = $scriptContent -split "`n" | Where-Object { $_ -match '^#\s*Author:\s*(.+)' } | Select-Object -First 1
  if ($authorLine -and $authorLine -match '^#\s*Author:\s*(.+)') {
    $author = $matches[1].Trim()
  }

  # Parse the script content into segments
  $segments = Parse-RunScriptContent -Content $scriptContent

  # Initialize an array to hold the formatted Markdown content
  $formattedContent = @()

  foreach ($segment in $segments) {
    if ($segment.Type -eq 'Code') {
      # Add PowerShell code block
      $formattedContent += "$($tripleBackticks)powershell"
      $formattedContent += $segment.Content.TrimEnd()
      $formattedContent += "$tripleBackticks`n"
    }
    elseif ($segment.Type -eq 'Markdown') {
      # Add Markdown content (trim to remove any leading/trailing whitespace)
      $formattedContent += $segment.Content.Trim()
      $formattedContent += "`n"
    }
  }

  # Prepare the tags string for front matter
  #$tagsString = $tags | ForEach-Object { "`"`"$_`"`" } -join ', '

  # Prepare the Markdown front matter with expanded metadata
  $markdownFrontMatter = @"
---
title: "$title"
date: "$date"
description: "$description"
tags: [$tagsString]
author: "$author"
---
`n
"@

  # Combine front matter and formatted content
  $fullMarkdownContent = $markdownFrontMatter + ($formattedContent -join "`n")

  # Write the Markdown content to the file
  try {
    Set-Content -Path $markdownFilePath -Value $fullMarkdownContent -Encoding UTF8
    Write-Host "Created Markdown file: $markdownFilePath"
  }
  catch {
    Write-Error "Failed to write to file $markdownFilePath. $_"
  }
}
