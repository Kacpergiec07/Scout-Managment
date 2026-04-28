import { ScoutProPlayer } from '../types/player';

export interface ClubContext {
  id: string;
  name: string;
  league?: string;
  dna: {
    possession: number; // 0-100
    pressing: number;   // 0-100
    tempo: number;      // 0-100
  };
  needs: {
    [position: string]: number; // 0-100 intensity of need
  };
  form: number; // 0-100 (points percentage last 5)
  historyMatch: number; // 0-100 (past pattern similarity)
  rank?: number; // League rank
}

export interface CompatibilityResult {
  totalScore: number;
  breakdown: {
    tactical: number;
    positional: number;
    stats: number;
    form: number;
    history: number;
  };
}

export function calculateCompatibility(
  player: ScoutProPlayer,
  club: ClubContext
): CompatibilityResult {
  // 1. Tactical (30%) - Based on DNA match
  const tacticalScore = Math.max(0, 100 - (
    Math.abs(player.stats.tactical.pressing - club.dna.pressing) +
    Math.abs(player.stats.tactical.progressivePasses - club.dna.possession) // simplified for MVP
  ) / 2);

  // 2. Positional (25%)
  const positionalScore = club.needs[player.position] || 50;

  // 3. Stats (25%) - Average of normalized categories
  const statsScore = (
    Object.values(player.stats.offensive).reduce((a, b) => a + b, 0) / 4 +
    Object.values(player.stats.defensive).reduce((a, b) => a + b, 0) / 4
  ); // This assumes they are already normalized 0-100 via benchmarking

  // 4. Form (12%)
  const formScore = club.form;

  // 5. History (8%)
  const historyScore = club.historyMatch;

  const totalScore = Math.round(
    (tacticalScore * 0.30) +
    (positionalScore * 0.25) +
    (statsScore * 0.25) +
    (formScore * 0.12) +
    (historyScore * 0.08)
  );

  return {
    totalScore,
    breakdown: {
      tactical: Math.round(tacticalScore),
      positional: Math.round(positionalScore),
      stats: Math.round(statsScore),
      form: Math.round(formScore),
      history: Math.round(historyScore)
    }
  };
}
