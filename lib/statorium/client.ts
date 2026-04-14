import { StatoriumPlayerBasic, StatoriumTeam, StatoriumTeamStats, StatoriumStanding } from './types';

const BASE_URL = 'https://api.statorium.com/api/v1';

export class StatoriumClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async fetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    // Statorium requires trailing slashes for resources but NOT for some lists? 
    // Based on tests, /players/1/ works, /leagues/ works.
    const url = new URL(`${BASE_URL}${endpoint}`);
    url.searchParams.append('apikey', this.apiKey);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 }, 
    } as any);

    if (!response.ok) {
      throw new Error(`Statorium API error: ${response.status} ${response.statusText} at ${endpoint}`);
    }

    return response.json();
  }

  async searchPlayers(query: string): Promise<StatoriumPlayerBasic[]> {
    console.log(`[StatoriumClient] Mock searching for: ${query}`);
    // Fallback Mock Pool for demonstration
    const mockPool: StatoriumPlayerBasic[] = [
      { playerID: '1', firstName: 'Łukasz', lastName: 'Fabiański', fullName: 'Łukasz Fabiański', position: 'GK' },
      { playerID: '10', firstName: 'Granit', lastName: 'Xhaka', fullName: 'Granit Xhaka', position: 'MF' },
      { playerID: '25', firstName: 'Erling', lastName: 'Haaland', fullName: 'Erling Haaland', position: 'FW' },
      { playerID: '30', firstName: 'Lionel', lastName: 'Messi', fullName: 'Lionel Messi', position: 'FW' },
      { playerID: '40', firstName: 'Cristiano', lastName: 'Ronaldo', fullName: 'Cristiano Ronaldo', position: 'FW' },
      { playerID: '50', firstName: 'Kylian', lastName: 'Mbappe', fullName: 'Kylian Mbappe', position: 'FW' },
      { playerID: '60', firstName: 'Robert', lastName: 'Lewandowski', fullName: 'Robert Lewandowski', position: 'FW' },
      { playerID: '70', firstName: 'Jude', lastName: 'Bellingham', fullName: 'Jude Bellingham', position: 'MF' }
    ];
    
    let matched = mockPool.filter(p => 
      p.fullName.toLowerCase().includes(query.toLowerCase())
    );

    // If no exact match in mock, return a generic "Search result" for the query to show it's active
    if (matched.length === 0 && query.length >= 3) {
      matched = [{
        playerID: 'mock-' + query,
        firstName: query,
        lastName: '(ScoutPro Match)',
        fullName: `${query} (Search Result)`,
        position: '?'
      }]
    }

    console.log(`[StatoriumClient] Found ${matched.length} matches`);
    return matched;
  }

  async getPlayerDetails(id: string): Promise<StatoriumPlayerBasic> {
    const data = await this.fetch<any>(`/players/${id}/`, { showstat: 'true' });
    return data.player;
  }

  async getTeamStats(teamId: string, seasonId?: string): Promise<StatoriumTeamStats> {
    const data = await this.fetch<any>(`/teams_stats/${teamId}/`, { season_id: seasonId || '' });
    return data.stats;
  }

  async getStandings(seasonId: string): Promise<StatoriumStanding[]> {
    const data = await this.fetch<any>(`/standings/${seasonId}/`);
    return data.standings || [];
  }

  async getPlayersByTeam(teamId: string, seasonId: string): Promise<StatoriumPlayerBasic[]> {
    const data = await this.fetch<any>(`/teams/${teamId}/`, { season_id: seasonId });
    return data.team.players || [];
  }
}

export const getStatoriumClient = () => {
  const key = process.env.STATORIUM_API_KEY;
  if (!key) throw new Error('STATORIUM_API_KEY not found in environment');
  return new StatoriumClient(key);
};
