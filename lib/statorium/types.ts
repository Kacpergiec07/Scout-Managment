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
