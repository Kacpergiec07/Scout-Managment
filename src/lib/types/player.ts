export type Position = 'GK' | 'CB' | 'LB' | 'RB' | 'CM' | 'CDM' | 'CAM' | 'LW' | 'RW' | 'ST';

export interface ScoutProPlayer {
  id: string; // Internal UUID or Statorium ID
  statoriumId?: string;
  name: string;
  age: number;
  nationality: string;
  position: Position;
  club: string;
  league: string;
  photoUrl?: string;
  
  // Normalized Stats (0-100 or raw values)
  stats: {
    offensive: {
      goals: number;
      assists: number;
      xG: number;
      xA: number;
      keyPasses: number;
    };
    defensive: {
      tackles: number;
      interceptions: number;
      aerialWins: number;
      clearances: number;
    };
    physical: {
      distance: number;
      sprints: number;
      stamina: number;
    };
    tactical: {
      dribbles: number;
      progressivePasses: number;
      passAccuracy: number;
      pressing: number;
    };
  };
  
  updatedAt: string;
}
