# Check what exports are being imported in hooks
Write-Host "Checking hook imports for missing exports..." -ForegroundColor Yellow

$hooksPath = "C:\Users\Hamna\Desktop\school frontend nexgen ai\NexGen_School_Frontend\src\hooks\data"
$hookFiles = Get-ChildItem $hooksPath -Filter "*.js" | Where-Object { $_.Name -ne "index.js" }

foreach ($hook in $hookFiles) {
    $content = Get-Content $hook.FullName -Raw
    $imports = $content | Select-String -Pattern 'import\s*\{([^}]+)\}\s*from\s*["\']@/modules/admin/store/adminThunks["\']' -AllMatches
    foreach ($match in $imports) {
        $importsList = $match.Matches[0].Groups[1].Value -split ',' | ForEach-Object { $_.Trim() }
        foreach ($import in $importsList) {
            Write-Host "  $hook.Name uses: $import" -ForegroundColor Cyan
        }
    }
}