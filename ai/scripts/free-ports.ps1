$ports = @(3000, 3001)

foreach ($port in $ports) {
  $connections = Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue
  if (-not $connections) {
    continue
  }

  $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($pidValue in $pids) {
    Stop-Process -Id $pidValue -Force -ErrorAction SilentlyContinue
  }
}

Write-Output "Freed ports: 3000, 3001"
