
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const CACHE_DIR = 'scratch/cache';

const POSITION_MAP: Record<string, string> = { "1": "GK", "2": "DF", "3": "MF", "4": "FW", "Goalkeeper": "GK", "Defender": "DF", "Midfielder": "MF", "Forward": "FW" };

function resolvePosition(raw: any): string {
  if (!raw) return "N/A";
  const str = String(raw).trim();
  if (POSITION_MAP[str]) return POSITION_MAP[str];
  return str;
}

async function main() {
  const files = fs.readdirSync(CACHE_DIR).filter(f => f.endsWith('.json'));
  console.log(`Found ${files.length} player files to upload.`);

  const BATCH_SIZE = 100;
  let batch = [];
  let count = 0;

  for (const file of files) {
    try {
      const player = JSON.parse(fs.readFileSync(path.join(CACHE_DIR, file), 'utf8'));
      if (!player.playerID) continue;

      // Find current team/season
      const currentStat = player.stat?.find((s: any) => 
        ['515', '558', '511', '521', '519'].includes(String(s.season_id))
      ) || player.stat?.[0];

      const playerData = {
        id: player.playerID.toString(),
        full_name: player.fullName || player.shortName,
        position: resolvePosition(player.position || player.additionalInfo?.position),
        team_id: (currentStat?.team_id || currentStat?.teamID || "0").toString(),
        team_name: currentStat?.team_name || "Unknown Team",
        season_id: (currentStat?.season_id || "515").toString(),
        photo_url: player.playerPhoto || player.photo || `https://api.statorium.com/media/bearleague/bl${player.playerID}.webp`,
        birthdate: player.additionalInfo?.birthdate || '',
        stats: player.stat || [],
        injury_status: 'Healthy',
        contract_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        last_synced: new Date().toISOString()
      };

      batch.push(playerData);

      if (batch.length >= BATCH_SIZE) {
        const { error } = await supabase.from('cached_players').upsert(batch);
        if (error) console.error(`Error uploading batch:`, error);
        else {
            count += batch.length;
            console.log(`Uploaded ${count} players...`);
        }
        batch = [];
      }
    } catch (e) {
      console.warn(`Failed to process ${file}`, e);
    }
  }

  if (batch.length > 0) {
    const { error } = await supabase.from('cached_players').upsert(batch);
    if (error) console.error(`Error uploading last batch:`, error);
    else {
        count += batch.length;
        console.log(`Finished! Total uploaded: ${count}`);
    }
  }
}

main();
