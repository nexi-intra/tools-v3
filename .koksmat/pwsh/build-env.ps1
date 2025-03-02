param (
  [string]$OutputFile = "temp.ps1"
)

# If the output file already exists, remove it to start fresh
if (Test-Path $OutputFile) {
  Remove-Item $OutputFile
}

"# Version 1" | Out-File -FilePath $OutputFile -Encoding UTF8
$dollar = '$'  # Escape the dollar sign to avoid variable expansion in the script

# Write initial headers to the output file
@"
# --------------------------------------
#  Generated by koksmat
# --------------------------------------

"@ | Out-File -FilePath $OutputFile -Encoding UTF8 -Force

# STEP 1: Find a list of .env files starting from current directory going upwards
$envFiles = New-Object System.Collections.Generic.List[string]
$currentDir = (Get-Location).ProviderPath

while ($true) {
  $envPath = Join-Path $currentDir ".env"
  if (Test-Path $envPath) {
    $envFiles.Add($envPath)
  }

  $parent = Split-Path $currentDir
  if ([string]::IsNullOrEmpty($parent) -or $parent -eq $currentDir) {
    break
  }
  $currentDir = $parent
}

# STEP 2: Output the full path of each found .env file to the console
Write-Host "Found the following .env files:"
$envFiles = $envFiles | Sort-Object Length

foreach ($file in $envFiles) {
  Write-Host $file
}

# STEP 3: Parse and write environment variables from each found .env file into the output file
# Note: The first found is from the closest directory, then upwards.
foreach ($envPath in $envFiles) {
  "`n#--------------------------------------" | Out-File -FilePath $OutputFile -Append -Encoding UTF8
  "# $envPath" | Out-File -FilePath $OutputFile -Append -Encoding UTF8
  "#--------------------------------------" | Out-File -FilePath $OutputFile -Append -Encoding UTF8

  $lines = Get-Content $envPath
  $isMultiline = $false
  $currentKey = ""
  $currentValue = ""

  foreach ($line in $lines) {
    $trimmedLine = $line.Trim()

    # Skip empty and comment lines
    if ([string]::IsNullOrWhiteSpace($trimmedLine) -or $trimmedLine.StartsWith("#")) {
      continue
    }

    if (-not $isMultiline) {
      # Parse KEY=VALUE
      $splitIndex = $trimmedLine.IndexOf("=")
      if ($splitIndex -gt 0) {
        $key = $trimmedLine.Substring(0, $splitIndex).Trim()
        $value = $trimmedLine.Substring($splitIndex + 1).Trim()

        # Check if value starts with a quote
        if (($value.StartsWith('"') -and -not $value.EndsWith('"')) -or
            ($value.StartsWith("'") -and -not $value.EndsWith("'"))) {
          # Start of a multiline value
          $isMultiline = $true
          $currentKey = $key
          $currentValue = $value.Substring(1) + "`n"  # Remove the starting quote and add newline
        }
        else {
          # Single-line value
          # If value isn't quoted, add quotes
          if (-not (($value.StartsWith('"') -and $value.EndsWith('"')) -or
                    ($value.StartsWith("'") -and $value.EndsWith("'")))) {
            $value = "`"$value`""
          }

          ($dollar + "env:$key = $value") | Out-File -FilePath $OutputFile -Append -Encoding UTF8
        }
      }
    }
    else {
      # Inside a multiline value
      if ($trimmedLine.EndsWith('"') -or $trimmedLine.EndsWith("'")) {
        # End of multiline value
        $currentValue += $trimmedLine.Substring(0, $trimmedLine.Length - 1)
        # Add closing quote
        $closingQuote = $trimmedLine[-1]
        $fullValue = "`"$currentValue`""  # Use double quotes for PowerShell
        ($dollar + "env:$currentKey = $fullValue") | Out-File -FilePath $OutputFile -Append -Encoding UTF8
        # Reset multiline flags
        $isMultiline = $false
        $currentKey = ""
        $currentValue = ""
      }
      else {
        # Continue accumulating multiline value
        $currentValue += $trimmedLine + "`n"
      }
    }
  }

  # Handle case where file ends while still in multiline
  if ($isMultiline) {
    $fullValue = "`"$currentValue`""  # Use double quotes for PowerShell
    ($dollar + "env:$currentKey = $fullValue") | Out-File -FilePath $OutputFile -Append -Encoding UTF8
  }
}

$workdir = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".." ".." ".koksmat" "workdir")) 
if (-not (Test-Path $workdir)) {
  New-Item -Path $workdir -ItemType Directory | Out-Null
}

@"

#--------------------------------------
#  End of .env files
#
#  Applying Additional settings
# 
#--------------------------------------
`$env:WORKDIR = "$workdir"
Write-Host "WORKDIR: `$workdir"

"@ | Out-File -FilePath $OutputFile -Append -Encoding UTF8
