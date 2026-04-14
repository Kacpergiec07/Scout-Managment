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
    const mockPool: (StatoriumPlayerBasic & { teamName?: string })[] = [
      { playerID: '1', firstName: 'Łukasz', lastName: 'Fabiański', fullName: 'Łukasz Fabiański', position: 'GK', country: 'Poland', teamName: 'West Ham' },
      { playerID: '10', firstName: 'Granit', lastName: 'Xhaka', fullName: 'Granit Xhaka', position: 'MF', country: 'Switzerland', teamName: 'Bayer Leverkusen' },
      { playerID: '25', firstName: 'Erling', lastName: 'Haaland', fullName: 'Erling Haaland', position: 'FW', country: 'Norway', teamName: 'Man City' },
      { playerID: '30', firstName: 'Lionel', lastName: 'Messi', fullName: 'Lionel Messi', position: 'FW', country: 'Argentina', teamName: 'Inter Miami' },
      { playerID: '40', firstName: 'Cristiano', lastName: 'Ronaldo', fullName: 'Cristiano Ronaldo', position: 'FW', country: 'Portugal', teamName: 'Al-Nassr' },
      { playerID: '50', firstName: 'Kylian', lastName: 'Mbappe', fullName: 'Kylian Mbappe', position: 'FW', country: 'France', teamName: 'Real Madrid' },
      { playerID: '60', firstName: 'Robert', lastName: 'Lewandowski', fullName: 'Robert Lewandowski', position: 'FW', country: 'Poland', teamName: 'FC Barcelona' },
      { playerID: '70', firstName: 'Jude', lastName: 'Bellingham', fullName: 'Jude Bellingham', position: 'MF', country: 'England', teamName: 'Real Madrid' },
      { playerID: '80', firstName: 'Lamine', lastName: 'Yamal', fullName: 'Lamine Yamal', position: 'FW', country: 'Spain', teamName: 'FC Barcelona' }
    ];
    
    let matched = mockPool.filter(p => 
      p.fullName.toLowerCase().includes(query.toLowerCase())
    );

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

export function getStatoriumClient() {
  const key = process.env.STATORIUM_API_KEY;
  if (!key) throw new Error('STATORIUM_API_KEY not found in environment');
  return new StatoriumClient(key);
}
