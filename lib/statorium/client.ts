import { StatoriumPlayerBasic, StatoriumTeam, StatoriumTeamStats, StatoriumStanding, StatoriumTransfer, StatoriumTeamDetail, StatoriumMatch, StatoriumLeague } from './types';

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
      next: { revalidate: 3600 }, 
    } as any);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[StatoriumClient] API Error ${response.status}:`, errorText);
      throw new Error(`Statorium API error: ${response.status} ${response.statusText} at ${endpoint}`);
    }

    const data = await response.json();
    console.log(`[StatoriumClient] Data from ${endpoint}:`, JSON.stringify(data).substring(0, 200) + '...');
    return data;
  }

  async searchPlayers(query: string): Promise<StatoriumPlayerBasic[]> {
    console.log(`[StatoriumClient] Mock searching for: ${query}`);
    const mockPool: (StatoriumPlayerBasic & { teamName?: string })[] = [
      { playerID: '1', firstName: 'Łukasz', lastName: 'Fabiański', fullName: 'Łukasz Fabiański', position: 'GK', country: 'Poland', teamName: 'West Ham' },
      { playerID: '10', firstName: 'Granit', lastName: 'Xhaka', fullName: 'Granit Xhaka', position: 'MF', country: 'Switzerland', teamName: 'Bayer Leverkusen' },
      { playerID: '25', firstName: 'Erling', lastName: 'Haaland', fullName: 'Erling Haaland', position: 'FW', country: 'Norway', teamName: 'Man City' },
      { playerID: '30', firstName: 'Lionel', lastName: 'Messi', fullName: 'Lionel Messi', position: 'FW', country: 'Argentina', teamName: 'Inter Miami' },
      { playerID: '40', firstName: 'Cristiano', lastName: 'Ronaldo', fullName: 'Cristiano Ronaldo', position: 'FW', country: 'Portugal', teamName: 'Al-Nassr' },
      { playerID: '50', firstName: 'Kylian', lastName: 'Mbappe', fullName: 'Kylian Mbappe', position: 'FW', country: 'France', teamName: 'Real Madrid' },
      { playerID: '60', firstName: 'Warren', lastName: 'Zaïre-Emery', fullName: 'Warren Zaïre-Emery', position: 'MF', country: 'France', teamName: 'PSG' },
      { playerID: '70', firstName: 'Jude', lastName: 'Bellingham', fullName: 'Jude Bellingham', position: 'MF', country: 'England', teamName: 'Real Madrid' },
      { playerID: '1731409249712', firstName: 'Lamine', lastName: 'Yamal', fullName: 'Lamine Yamal', position: 'FW', country: 'Spain', teamName: 'FC Barcelona' },
      { playerID: '1731409249710', firstName: 'Florian', lastName: 'Wirtz', fullName: 'Florian Wirtz', position: 'MF', country: 'Germany', teamName: 'Liverpool FC' },
      { playerID: '1731409249713', firstName: 'Amadou', lastName: 'Onana', fullName: 'Amadou Onana', position: 'MF', country: 'Belgium', teamName: 'Aston Villa' },
      { playerID: '1731409249714', firstName: 'Gonçalo', lastName: 'Inácio', fullName: 'Gonçalo Inácio', position: 'DF', country: 'Portugal', teamName: 'Sporting CP' },
      { playerID: '1731409249716', firstName: 'Viktor', lastName: 'Gyökeres', fullName: 'Viktor Gyökeres', position: 'FW', country: 'Sweden', teamName: 'Arsenal' }
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
    // Handle different nesting (data.standings, data.season.standings or data.league.standings)
    let list = data.standings || data.season?.standings || [];
    if (!list.length && data.league?.standings) {
      list = data.league.standings;
    }
    return list;
  }

  async getPlayersByTeam(teamId: string, seasonId: string): Promise<StatoriumPlayerBasic[]> {
    const data = await this.fetch<any>(`/teams/${teamId}/`, { season_id: seasonId });
    return data.team.players || [];
  }

  async getTransfers(teamId?: string, seasonId?: string): Promise<StatoriumTransfer[]> {
    const params: Record<string, string> = {};
    if (teamId) params.team_id = teamId;
    if (seasonId) params.season_id = seasonId;
    
    const data = await this.fetch<any>('/transfers/', params);
    return data.transfers || [];
  }

  async getTeamDetails(teamId: string): Promise<StatoriumTeamDetail> {
    const data = await this.fetch<any>(`/teams/${teamId}/`);
    return data.team;
  }

  async getMatches(seasonId: string): Promise<StatoriumMatch[]> {
    const data = await this.fetch<any>(`/matches/`, { season_id: seasonId });
    if (data.calendar && data.calendar.matchdays) {
      return data.calendar.matchdays.flatMap((md: any) => md.matches || []);
    }
    return data.matches || [];
  }

  async getMatchDetails(matchId: string): Promise<any> {
    const data = await this.fetch<any>(`/matches/${matchId}/`);
    return data.match;
  }

  async getLeagues(): Promise<StatoriumLeague[]> {
    const data = await this.fetch<any>(`/leagues/`);
    return data.leagues || [];
  }
}

export function getStatoriumClient() {
  const key = process.env.STATORIUM_API_KEY;
  if (!key) throw new Error('STATORIUM_API_KEY not found in environment');
  return new StatoriumClient(key);
}
