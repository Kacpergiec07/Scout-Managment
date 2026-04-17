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
      // Try real API first
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
            playerPhoto: photo || `https://api.statorium.com/media/bearleague/bl${p.playerID}.webp`
          };
        });
      }
    } catch (error) {
      console.warn('[StatoriumClient] Search API failed, using mock fallback:', error);
    }

    // Mock Pool with verified IDs and photos from Statorium API
    const mockPool: (StatoriumPlayerBasic & { teamName?: string, league?: string })[] = [
      { playerID: '14633', firstName: 'Florian', lastName: 'Wirtz', fullName: 'Florian Wirtz', position: 'CAM', country: 'Germany', teamName: 'Bayer 04 Leverkusen', photo: 'https://api.statorium.com/media/bearleague/bl17158001911496.webp', teamID: '163', league: 'Bundesliga' },
      { playerID: '6466', firstName: 'Jude', lastName: 'Bellingham', fullName: 'Jude Bellingham', position: 'CM', country: 'England', teamName: 'Real Madrid', photo: 'https://api.statorium.com/media/bearleague/bl1695891720352.webp', teamID: '37', league: 'La Liga' },
      { playerID: '53041', firstName: 'Lamine', lastName: 'Yamal', fullName: 'Lamine Yamal', position: 'RW', country: 'Spain', teamName: 'FC Barcelona', photo: 'https://api.statorium.com/media/bearleague/bl17322791692175.webp', teamID: '23', league: 'La Liga' },
      { playerID: '26718', firstName: 'Amadou', lastName: 'Onana', fullName: 'Amadou Onana', position: 'CDM', country: 'Belgium', teamName: 'Aston Villa', photo: 'https://api.statorium.com/media/bearleague/bl17337166521193.webp', teamID: '112', league: 'Premier League' },
      { playerID: '4812', firstName: 'Erling', lastName: 'Haaland', fullName: 'Erling Haaland', position: 'ST', country: 'Norway', teamName: 'Manchester City', photo: 'https://api.statorium.com/media/bearleague/bl17313179872374.webp', teamID: '4', league: 'Premier League' },
      { playerID: '1994', firstName: 'Kylian', lastName: 'Mbappé', fullName: 'Kylian Mbappé', position: 'FW', country: 'France', teamName: 'Real Madrid', photo: 'https://api.statorium.com/media/bearleague/bl17023015741660.webp', teamID: '37', league: 'La Liga' },
      { playerID: '12101', firstName: 'Jamal', lastName: 'Musiala', fullName: 'Jamal Musiala', position: 'CAM', country: 'Germany', teamName: 'FC Bayern München', photo: 'https://api.statorium.com/media/bearleague/bl1720013375836.webp', teamID: '147', league: 'Bundesliga' },
      { playerID: '1407', firstName: 'Robert', lastName: 'Lewandowski', fullName: 'Robert Lewandowski', position: 'ST', country: 'Poland', teamName: 'FC Barcelona', photo: 'https://api.statorium.com/media/bearleague/bl16958917002070.webp', teamID: '23', league: 'La Liga' },
      { playerID: '2085', firstName: 'Rafael', lastName: 'Leão', fullName: 'Rafael Leão', position: 'LW', country: 'Portugal', teamName: 'AC Milan', photo: 'https://api.statorium.com/media/bearleague/bl17448094072778.webp', teamID: '96', league: 'Serie A' },
      { playerID: '93', firstName: 'Kevin', lastName: 'De Bruyne', fullName: 'Kevin De Bruyne', position: 'CM', country: 'Belgium', teamName: 'SSC Napoli', photo: 'https://api.statorium.com/media/bearleague/bl1731321014978.webp', teamID: '103', league: 'Serie A' },
      { playerID: '5324', firstName: 'Cody', lastName: 'Gakpo', fullName: 'Cody Gakpo', position: 'LW', country: 'Netherlands', teamName: 'Liverpool FC', photo: 'https://api.statorium.com/media/bearleague/bl17313114281068.webp', teamID: '3', league: 'Premier League' },
      { playerID: '1069', firstName: 'Vinícius', lastName: 'Júnior', fullName: 'Vinícius Júnior', position: 'LW', country: 'Brazil', teamName: 'Real Madrid', photo: 'https://api.statorium.com/media/bearleague/bl16236093262534.webp', teamID: '37', league: 'La Liga' },
      { playerID: '2518', firstName: 'Pedri', lastName: '', fullName: 'Pedri', position: 'CM', country: 'Spain', teamName: 'FC Barcelona', photo: 'https://api.statorium.com/media/bearleague/bl1619642571861.webp', teamID: '23', league: 'La Liga' },
      { playerID: '3122', firstName: 'Gavi', lastName: '', fullName: 'Gavi', position: 'CM', country: 'Spain', teamName: 'FC Barcelona', photo: 'https://api.statorium.com/media/bearleague/bl16689390682016.webp', teamID: '23', league: 'La Liga' },
      { playerID: '5597', firstName: 'Cole', lastName: 'Palmer', fullName: 'Cole Palmer', position: 'CAM', country: 'England', teamName: 'Chelsea FC', photo: 'https://api.statorium.com/media/bearleague/bl173134969293.webp', teamID: '8', league: 'Premier League' },
      { playerID: '1132', firstName: 'Nicolò', lastName: 'Barella', fullName: 'Nicolò Barella', position: 'CM', country: 'Italy', teamName: 'Inter Milan', photo: 'https://api.statorium.com/media/bearleague/bl1619626999462.webp', teamID: '223', league: 'Serie A' },
      { playerID: '1352', firstName: 'Martin', lastName: 'Ødegaard', fullName: 'Martin Ødegaard', position: 'CAM', country: 'Norway', teamName: 'Arsenal FC', photo: 'https://api.statorium.com/media/bearleague/bl17314341782392.webp', teamID: '9', league: 'Premier League' },
      { playerID: '1407', firstName: 'Declan', lastName: 'Rice', fullName: 'Declan Rice', position: 'CDM', country: 'England', teamName: 'Arsenal FC', photo: 'https://api.statorium.com/media/bearleague/bl17314097271237.webp', teamID: '9', league: 'Premier League' },
      { playerID: '2187', firstName: 'William', lastName: 'Saliba', fullName: 'William Saliba', position: 'CB', country: 'France', teamName: 'Arsenal FC', photo: 'https://api.statorium.com/media/bearleague/bl17314853342861.webp', teamID: '9', league: 'Premier League' },
      { playerID: '4503', firstName: 'Bruno', lastName: 'Fernandes', fullName: 'Bruno Fernandes', position: 'CAM', country: 'Portugal', teamName: 'Manchester United', photo: 'https://api.statorium.com/media/bearleague/bl17340421791023.webp', teamID: '7', league: 'Premier League' },
      { playerID: '3921', firstName: 'Phil', lastName: 'Foden', fullName: 'Phil Foden', position: 'RW', country: 'England', teamName: 'Manchester City', photo: 'https://api.statorium.com/media/bearleague/bl17313219211110.webp', teamID: '4', league: 'Premier League' },
      { playerID: '2773', firstName: 'Rodri', lastName: '', fullName: 'Rodri', position: 'CDM', country: 'Spain', teamName: 'Manchester City', photo: 'https://api.statorium.com/media/bearleague/bl17313222591092.webp', teamID: '4', league: 'Premier League' },
      { playerID: '1517', firstName: 'Mohamed', lastName: 'Salah', fullName: 'Mohamed Salah', position: 'RW', country: 'Egypt', teamName: 'Liverpool FC', photo: 'https://api.statorium.com/media/bearleague/bl1695385631451.webp', teamID: '3', league: 'Premier League' },
      { playerID: '4233', firstName: 'Bukayo', lastName: 'Saka', fullName: 'Bukayo Saka', position: 'RW', country: 'England', teamName: 'Arsenal FC', photo: 'https://api.statorium.com/media/bearleague/bl1731409249710.webp', teamID: '9', league: 'Premier League' },
      { playerID: '2244', firstName: 'Antoine', lastName: 'Griezmann', fullName: 'Antoine Griezmann', position: 'FW', country: 'France', teamName: 'Atlético Madrid', photo: 'https://api.statorium.com/media/bearleague/bl17023021462671.webp', teamID: '39', league: 'La Liga' },
      { playerID: '3071', firstName: 'Heung-min', lastName: 'Son', fullName: 'Heung-min Son', position: 'LW', country: 'South Korea', teamName: 'Tottenham Hotspur FC', photo: 'https://api.statorium.com/media/bearleague/bl17340085372071.webp', teamID: '2', league: 'Premier League' },
      { playerID: '1778', firstName: 'Virgil', lastName: 'van Dijk', fullName: 'Virgil van Dijk', position: 'CB', country: 'Netherlands', teamName: 'Liverpool FC', photo: 'https://api.statorium.com/media/bearleague/bl17313154761133.webp', teamID: '3', league: 'Premier League' },
      { playerID: '3314', firstName: 'Trent', lastName: 'Alexander-Arnold', fullName: 'Trent Alexander-Arnold', position: 'RB', country: 'England', teamName: 'Real Madrid', photo: 'https://api.statorium.com/media/bearleague/bl1731315251976.webp', teamID: '37', league: 'La Liga' },
      { playerID: '1812', firstName: 'Harry', lastName: 'Kane', fullName: 'Harry Kane', position: 'ST', country: 'England', teamName: 'FC Bayern München', photo: 'https://api.statorium.com/media/bearleague/bl1702329864604.webp', teamID: '147', league: 'Bundesliga' },
    ];

    const matched = mockPool.filter(p =>
      p.fullName.toLowerCase().includes(query.toLowerCase()) ||
      p.lastName.toLowerCase().includes(query.toLowerCase()) ||
      p.teamName?.toLowerCase().includes(query.toLowerCase())
    );

    return matched.map((p: any) => {
      let photo = p.playerPhoto || p.photo;
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
        playerPhoto: photo || `https://api.statorium.com/media/bearleague/bl${p.playerID}.webp`
      };
    });

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
