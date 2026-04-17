
$path = "components\scout\transfer-flow.tsx"
$content = Get-Content $path
$start = 881 # 1-indexed line 882 is index 881
$end = 897   # 1-indexed line 898 is index 897

$newLines = @(
'                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 relative overflow-hidden group-hover:scale-110 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] p-1.5">',
'                         {(() => {',
'                            const logo = allClubs.find(c => c.id === t.toTeamID || t.toTeamName.includes(c.name) || c.name.includes(t.toTeamName))?.logo;',
'                            return logo ? (',
'                              <img',
'                                src={logo}',
'                                alt={t.toTeamName}',
'                                className="w-full h-full object-contain"',
'                                onError={(e) => {',
'                                  (e.target as HTMLImageElement).style.display = "none";',
'                                }}',
'                              />',
'                            ) : (',
'                              <ArrowRightLeft className="w-4 h-4 text-white/20" />',
'                            );',
'                         })()}',
'                      </div>'
)

$before = $content[0..($start-1)]
$after = $content[($end+1)..($content.Length-1)]

$final = $before + $newLines + $after
$final | Set-Content $path -Encoding UTF8
