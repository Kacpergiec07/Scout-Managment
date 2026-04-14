import { StatoriumPlayerBasic, StatoriumTeam, StatoriumTeamStats } from './types';

const BASE_URL = 'https://api.statorium.com/api/v1';

export class StatoriumClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async fetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${BASE_URL}${endpoint}`);
    url.searchParams.append('apikey', this.apiKey);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 }, // Cache for 1 hour by default
    });

    if (!response.ok) {
      throw new Error(`Statorium API error: ${response.statusText}`);
    }

    return response.json();
  }

  async searchPlayers(query: string): Promise<StatoriumPlayerBasic[]> {
    // Note: Statorium API might have unique search endpoints per league or global
    // Fallback: search-like fetch depending on their specific docs
    const data = await this.fetch<any>('/players/', { query });
    return data.players || [];
  }

  async getPlayerDetails(id: string): Promise<StatoriumPlayerBasic> {
    const data = await this.fetch<any>(`/players/${id}/`, { showstat: 'true' });
    return data.player;
  }

  async getTeamStats(teamId: string, seasonId?: string): Promise<StatoriumTeamStats> {
    const data = await this.fetch<any>(`/teams_stats/${teamId}/`, { season_id: seasonId || '' });
    return data.stats;
  }
}

export const getStatoriumClient = () => {
  const key = process.env.STATORIUM_API_KEY;
  if (!key) throw new Error('STATORIUM_API_KEY not found in environment');
  return new StatoriumClient(key);
};
