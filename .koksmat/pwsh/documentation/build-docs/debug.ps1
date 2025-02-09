Push-Location
try {
  Set-Location $PSScriptRoot
  $root = [System.IO.Path]::GetFullPath((join-path $PSScriptRoot .. .. .. .. )) 
  . "$root/.koksmat/pwsh/build-env.ps1"
  . "$PSScriptRoot/temp.ps1"
  . "$PSScriptRoot/run.ps1"
}
catch {
  write-host "Error: $_" -ForegroundColor:Red
  <#Do this if a terminating exception happens#>
}
finally {
  Pop-Location
}