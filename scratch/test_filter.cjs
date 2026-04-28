const TEAM_TO_LEAGUE = {
  // Premier League
  "4": "Premier League", // Man City
  "16": "Premier League", // Bournemouth
  "2": "Premier League", // Tottenham
  "15": "Premier League", // Crystal Palace
  "112": "Premier League", // Aston Villa
  "7": "Premier League", // Man Utd
  "6": "Premier League", // Everton
  "8": "Premier League", // Chelsea
  "9": "Premier League", // Arsenal
  "3": "Premier League", // Liverpool

  // La Liga
  "37": "La Liga", // Real Madrid
  "39": "La Liga", // Atletico Madrid
  "23": "La Liga", // Barcelona
  "26": "La Liga", // Girona

  // Serie A
  "105": "Serie A", // Juventus
  "41": "Serie A", // Atalanta
  "96": "Serie A", // AC Milan
  "93": "Serie A", // Bologna

  // Bundesliga
  "47": "Bundesliga", // Bayern Munich
  "166": "Bundesliga", // RB Leipzig

  // Ligue 1
  "66": "Ligue 1", // PSG
  "69": "Ligue 1", // Lille
};

const transfers = [
  { id: "v1", playerName: "Kylian Mbappé", playerID: "1994", fromTeamID: "66", fromTeamName: "PSG", toTeamID: "37", toTeamName: "Real Madrid", fee: "Free", color: "#facc15", marketValue: "€180M", photoUrl: "https://api.statorium.com/media/bearleague/bl1994.webp", position: "FW" }
];

const appliedFilters = {
  selectedLeagues: ["Ligue 1"],
  feeRange: [0, 150],
  sortOrder: "NONE"
};

let result = transfers.filter(t => {
      // League Filter
      if (appliedFilters.selectedLeagues.length > 0) {
        const fromLeague = TEAM_TO_LEAGUE[t.fromTeamID]
        const toLeague = TEAM_TO_LEAGUE[t.toTeamID]
        const matchesLeague = appliedFilters.selectedLeagues.some(l => l === fromLeague || l === toLeague)
        if (!matchesLeague) return false
      }

      // Fee Filter
      if (t.fee !== 'Free') {
        const feeVal = parseInt(t.fee.replace('€', '').replace('M', '')) || 0
        if (feeVal < appliedFilters.feeRange[0] || feeVal > appliedFilters.feeRange[1]) return false
      } else if (appliedFilters.feeRange[0] > 0) {
        return false // Free agents only if min fee is 0
      }

      return true
});
console.log("Filtered length:", result.length);
