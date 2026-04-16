$filepath = "components\scout\transfer-flow.tsx"
$content = [System.IO.File]::ReadAllText($filepath, [System.Text.Encoding]::UTF8)

# Normalize line endings for matching
$normalized = $content.Replace("`r`n", "`n")

$targetPattern = '                     <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 relative overflow-hidden group-hover:scale-110 group-hover:bg-primary/20 transition-all shadow-[0_0_15px_rgba(59,130,246,0.1)]">'

if ($normalized.Contains($targetPattern)) {
    Write-Host "Pattern found! Applying replacement..."
    
    $newAvatarBlock = @'
                     <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center flex-shrink-0 relative overflow-hidden group-hover:scale-110 transition-all shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                        {/* Initials – always rendered as the base layer */}
                        <span className="text-[10px] font-black text-primary/70 uppercase tracking-tighter select-none group-hover:text-primary transition-colors">
                           {t.playerName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </span>
                        {/* Photo overlay – sits on top and hides initials when loaded */}
                        {t.photoUrl && (
                          <img
                            src={t.photoUrl}
                            alt={t.playerName}
                            className="absolute inset-0 w-full h-full object-cover object-top transition-all duration-500"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                     </div>
'@

    $oldBlock = @'
                     <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 relative overflow-hidden group-hover:scale-110 group-hover:bg-primary/20 transition-all shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                        {t.photoUrl ? (
                          <img 
                            src={t.photoUrl} 
                            alt={t.playerName} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" 
                            onError={(e) => { 
                              // If API photo fails, remove it and let the initials show
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).parentElement!.classList.add('bg-black');
                            }}
                          />
                        ) : null}
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-primary/60 uppercase tracking-tighter select-none -z-10 group-hover:text-primary transition-colors">
                           {t.playerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                     </div>
'@

    $newNormalized = $normalized.Replace($oldBlock, $newAvatarBlock)
    
    if ($newNormalized -ne $normalized) {
        # Restore CRLF
        $result = $newNormalized.Replace("`n", "`r`n")
        [System.IO.File]::WriteAllText($filepath, $result, [System.Text.Encoding]::UTF8)
        Write-Host "SUCCESS: File updated!"
    } else {
        Write-Host "ERROR: Replacement did not change file. Old block may not match exactly."
        # Debug: find the actual lines around the pattern
        $lines = $normalized.Split("`n")
        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($lines[$i].Contains("bg-primary/10 border border-primary/20")) {
                Write-Host "Found at line $($i+1): '$($lines[$i])'"
                for ($j = [Math]::Max(0,$i-1); $j -le [Math]::Min($lines.Count-1,$i+20); $j++) {
                    Write-Host "  L$($j+1): $($lines[$j])"
                }
                break
            }
        }
    }
} else {
    Write-Host "Pattern not found at all!"
    # Debug to find relevant part
    $idx = $content.IndexOf("bg-primary/10 border border-primary/20")
    if ($idx -ge 0) {
        Write-Host "Found substring at index $idx"
        Write-Host $content.Substring([Math]::Max(0, $idx-100), 500)
    }
}
