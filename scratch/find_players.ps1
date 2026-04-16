# Script to extract player IDs and photos from team rosters
$players = @{
    "Alvarez" = @("Álvarez", "lvarez", "Alvarez")
    "Olise" = @("Olise", "olise")
    "Koopmeiners" = @("Koopmeiners", "koopmeiners")
    "Douglas" = @("Douglas", "douglas")
    "Yoro" = @("Yoro", "yoro")
    "Neves" = @("Neves", "neves", "Jo")
    "Olmo" = @("Olmo", "olmo")
    "Onana" = @("Onana", "onana")
    "Morata" = @("Morata", "morata")
    "Gallagher" = @("Gallagher", "gallagher")
    "Chiesa" = @("Chiesa", "chiesa")
    "Calafiori" = @("Calafiori", "calafiori")
    "Savio" = @("Savio", "Sávio")
    "Gundogan" = @("Gündogan", "Gundogan", "ndogan")
}

$files = @{
    "AtleticoMadrid" = "C:\Users\brode\.gemini\antigravity\brain\a497e819-6301-42b5-ae26-3d6a701cec40\.system_generated\steps\146\content.md"
    "Juventus" = "C:\Users\brode\.gemini\antigravity\brain\a497e819-6301-42b5-ae26-3d6a701cec40\.system_generated\steps\147\content.md"
    "Barcelona" = "C:\Users\brode\.gemini\antigravity\brain\a497e819-6301-42b5-ae26-3d6a701cec40\.system_generated\steps\148\content.md"
    "ManCity" = "C:\Users\brode\.gemini\antigravity\brain\a497e819-6301-42b5-ae26-3d6a701cec40\.system_generated\steps\127\content.md"
    "Bayern" = "C:\Users\brode\.gemini\antigravity\brain\a497e819-6301-42b5-ae26-3d6a701cec40\.system_generated\steps\128\content.md"
}

foreach ($team in $files.Keys) {
    if (-not (Test-Path $files[$team])) { continue }
    $content = Get-Content $files[$team] -Raw
    Write-Host "`n=== $team ===" 
    foreach ($playerName in $players.Keys) {
        foreach ($searchTerm in $players[$playerName]) {
            if ($content -match '"playerID":(\d+)[^{]*' + [regex]::Escape($searchTerm)) {
                $id = $matches[1]
                # Try to find photo near this playerID
                $idx = $content.IndexOf('"playerID":' + $id)
                if ($idx -ge 0) {
                    $segment = $content.Substring($idx, [Math]::Min(600, $content.Length - $idx))
                    if ($segment -match '"photo":"([^"]*)"') {
                        Write-Host "  $playerName (${team}): ID=$id, photo=$($matches[1])"
                    } else {
                        Write-Host "  $playerName (${team}): ID=$id, photo=<empty>"
                    }
                }
                break
            }
        }
    }
}
