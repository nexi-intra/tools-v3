

$root = [System.IO.Path]::GetFullPath((join-path $PSScriptRoot .. .. .. .. )) 
$env:workdir = [System.IO.Path]::GetFullPath((join-path $root ".koksmat" "workdir" )) 
. "$root/.koksmat/pwsh/check-env.ps1" "DOC_REPO"

try {
  Push-Location
  Set-Location $root
  write-host "Root: $root"
  . "$PSScriptRoot/actions.ps1"

  write-host "Updating " $env:DOC_REPO
}
catch {
  Write-Host "Error: $_" -ForegroundColor:Red
  <#Do this if a terminating exception happens#>
}
finally {
  Pop-Location
}
