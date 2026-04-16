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
      {
        playerID: '14633',
        firstName: 'Florian',
        lastName: 'Wirtz',
        fullName: 'Florian Wirtz',
        position: 'CAM',
        country: 'Germany',
        teamName: 'Liverpool FC',
        photo: 'https://api.statorium.com/media/bearleague/bl17158001911496.webp'
      },
      {
        playerID: '6466',
        firstName: 'Jude',
        lastName: 'Bellingham',
        fullName: 'Jude Bellingham',
        position: 'CM',
        country: 'England',
        teamName: 'Real Madrid',
        photo: 'https://api.statorium.com/media/bearleague/bl1695891720352.webp'
      },
      {
        playerID: '53041',
        firstName: 'Lamine',
        lastName: 'Yamal',
        fullName: 'Lamine Yamal',
        position: 'RW',
        country: 'Spain',
        teamName: 'FC Barcelona',
        photo: 'https://api.statorium.com/media/bearleague/bl17322791692175.webp'
      },
      {
        playerID: '26718',
        firstName: 'Amadou',
        lastName: 'Onana',
        fullName: 'Amadou Onana',
        position: 'CDM',
        country: 'Belgium',
        teamName: 'Aston Villa',
        photo: 'https://api.statorium.com/media/bearleague/bl17337166521193.webp'
      },
      {
        playerID: '3482',
        firstName: 'Lautaro',
        lastName: 'Martínez',
        fullName: 'Lautaro Martínez',
        position: 'ST',
        country: 'Argentina',
        teamName: 'Inter Milan',
        photo: 'https://api.statorium.com/media/bearleague/bl1695386805672.webp'
      },
      {
        playerID: '670',
        firstName: 'Ousmane',
        lastName: 'Dembélé',
        fullName: 'Ousmane Dembélé',
        position: 'RW',
        country: 'France',
        teamName: 'Paris Saint-Germain',
        photo: 'https://api.statorium.com/media/bearleague/bl1702304187852.webp'
      },
      {
        playerID: '4812',
        firstName: 'Erling',
        lastName: 'Haaland',
        fullName: 'Erling Haaland',
        position: 'ST',
        country: 'Norway',
        teamName: 'Man City',
        photo: 'https://api.statorium.com/media/bearleague/bl17313179872374.webp'
      },
      {
        playerID: '1994',
        firstName: 'Kylian',
        lastName: 'Mbappé',
        fullName: 'Kylian Mbappé',
        position: 'FW',
        country: 'France',
        teamName: 'Real Madrid',
        photo: 'https://api.statorium.com/media/bearleague/bl17023015741660.webp'
      }
    ];

    let matched = mockPool.filter(p =>
      p.fullName.toLowerCase().includes(query.toLowerCase())
    );

    return matched.map((p: any) => ({
      ...p,
      playerPhoto: p.playerPhoto || p.photo || `https://api.statorium.com/media/bearleague/bl${p.playerID}.webp`
    }));
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
