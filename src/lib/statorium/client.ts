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
    try {
      const data = await this.fetch<any>('/players/', { q: query });
      if (data.players && data.players.length > 0) {
        return data.players.map((p: any) => {
          let photo = p.photo || p.image || p.playerPhoto;
          if (photo && !photo.startsWith('http')) {
            const cleanPath = photo.startsWith('/') ? photo : `/${photo}`;
            if (!cleanPath.startsWith('/media/bearleague/')) {
              photo = `https://api.statorium.com/media/bearleague${cleanPath}`;
            } else {
              photo = `https://api.statorium.com${cleanPath}`;
            }
          }
          return {
            ...p,
            playerPhoto: photo || `https://api.statorium.com/media/bearleague/bl${p.playerID || p.id}.webp`
          };
        });
      }
      return [];
    } catch (error) {
      console.warn('[StatoriumClient] Search API failed:', error);
      return [];
    }
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
    
    // Statorium API can nest standings in many ways. Let's be thorough.
    let list: any[] = [];
    
    if (data.standings) {
      list = data.standings;
    } else if (data.season?.standings) {
      list = data.season.standings;
    } else if (data.league?.standings) {
      list = data.league.standings;
    } else if (data.season?.groups && data.season.groups.length > 0) {
      list = data.season.groups[0].standings || [];
    } else if (data.league?.groups && data.league.groups.length > 0) {
      list = data.league.groups[0].standings || [];
    }
    
    // If it's wrapped in an object like { "515": [...] }
    if (!Array.isArray(list) && typeof list === 'object') {
       const keys = Object.keys(list);
       if (keys.length > 0) list = (list as any)[keys[0]];
    }

    return Array.isArray(list) ? list : [];
  }

  async getPlayersByTeam(teamId: string, seasonId: string): Promise<StatoriumPlayerBasic[]> {
    // Use the squad endpoint which returns more complete player data
    const data = await this.fetch<any>(`/teams/${teamId}/squad/${seasonId}/`, { season_id: seasonId, showstat: '1' });
    return data.team?.players || data.players || data.team?.squad || [];
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

  async getMatches(seasonId: string, participantId?: string): Promise<StatoriumMatch[]> {
    const params: Record<string, string> = { season_id: seasonId };
    if (participantId) params.participant_id = participantId;

    // Try primary query
    let data = await this.fetch<any>(`/matches/`, params);
    
    // If empty and we didn't use participantId yet, try with league_id fallback
    if ((!data.matches || data.matches.length === 0) && (!data.calendar)) {
      const LEAGUE_MAP: Record<string, string> = { "515": "1", "558": "2", "511": "4", "521": "3", "519": "5" };
      if (LEAGUE_MAP[seasonId]) {
         params.league_id = LEAGUE_MAP[seasonId];
         data = await this.fetch<any>(`/matches/`, params);
      }
    }

    if (data.calendar && data.calendar.matchdays) {
      return data.calendar.matchdays.flatMap((md: any) => md.matches || []);
    }
    return data.matches || [];
  }

  async getMatchDetails(matchId: string): Promise<any> {
    const data = await this.fetch<any>(`/matches/${matchId}/`, { details: '1' });
    return data.match;
  }

  async getTopScorers(seasonId: string): Promise<any[]> {
    const data = await this.fetch<any>(`/scorers/${seasonId}/`);
    return data.scorers || [];
  }
}

export function getStatoriumClient() {
  const key = process.env.STATORIUM_API_KEY;
  if (!key) throw new Error('STATORIUM_API_KEY not found in environment');
  return new StatoriumClient(key);
}
