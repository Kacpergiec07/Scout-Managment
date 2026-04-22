/**
 * Statorium API Response Types (Partial based on Scout Pro needs)
 */

export interface StatoriumTeam {
  teamID: string
  teamName: string
  teamShortName: string
  teamLogo?: string
}

export interface StatoriumSeasonStats {
  season_name: string;
  season_id: string;
  team_name: string;
  played: string;
  career_lineup: string;
  career_minutes: string;
  career_subsin: string;
  career_subsout: string;
  "Goals": string;
  "Goal": string;
  "Assist": string;
  "Yellow card": string;
  "Second yellow": string;
  "Red card": string;
  "Own goal": string;
  "Penalty goal": string;
  "Missed penalty": string;
  "Penalty shootout scored": string;
  "Penalty shootout missed": string;
}

export interface StatoriumPlayerBasic {
  playerID: string
  firstName: string
  lastName: string
  fullName: string
  photo?: string
  playerPhoto?: string
  country?: string | { name: string; id: string }
  teamName?: string
  birthdate?: string
  position?: string
  weight?: string
  height?: string
  age?: number | string
  goals?: number
  assists?: number
  yellowCards?: number
  redCards?: number
  matchesPlayed?: number
  minutesPlayed?: number
  rating?: number
  // Additional fields that might come from API
  season_stats?: any
  performance?: any
  stats?: any
  additionalInfo?: any
  stat?: StatoriumSeasonStats[]
}

export interface StatoriumPlayerStats {
  goals?: number
  assists?: number
  yellow_cards?: number
  red_cards?: number
  matches_played?: number
  minutes_played?: number
  // Add more as discovered from real API response
}

export interface StatoriumTeamStats {
  matchesPlayed: number
  wins: number
  draws: number
  losses: number
  points: number
  goalsFor: number
  goalsAgainst: number
}
export interface StatoriumStanding {
  teamID: string;
  teamName: string;
  teamLogo: string;
  rank: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  formObjects?: { result: string; matchId: string }[];
}

export interface StatoriumTransfer {
  playerID: string;
  playerName: string;
  fromTeamID: string;
  fromTeamName: string;
  toTeamID: string;
  toTeamName: string;
  date: string;
  season: string;
  type: 'In' | 'Out';
  fee?: string;
  marketValue?: string;
}

export interface StatoriumTeamDetail extends StatoriumTeam {
  city?: string;
  country?: string;
  venueName?: string;
  address?: string;
  website?: string;
  founded?: string;
  formation?: string;
  coach?: string;
  players?: StatoriumPlayerBasic[];
}

export interface StatoriumMatch {
  matchID: string;
  homeTeam: StatoriumTeam;
  awayTeam: StatoriumTeam;
  homeParticipant?: { participantName: string; logo: string };
  awayParticipant?: { participantName: string; logo: string };
  homeScore?: number;
  awayScore?: number;
  matchDate: string;
  matchTime: string;
  status: string; // 'Upcoming', 'Played', 'Live'
  competitionName?: string;
}

export interface StatoriumLeague {
  leagueID: string;
  leagueName: string;
  countryName: string;
  logo?: string;
}
