/**
 * Statorium API Response Types (Partial based on Scout Pro needs)
 */

export interface StatoriumTeam {
  teamID: string
  teamName: string
  teamShortName: string
  teamLogo?: string
}

export interface StatoriumPlayerBasic {
  playerID: string
  firstName: string
  lastName: string
  fullName: string
  photo?: string
  country?: string
  teamName?: string
  birthdate?: string
  position?: string
  weight?: string
  height?: string
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
  rank: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
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
