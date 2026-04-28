import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const CACHE_DIR = path.join(process.cwd(), 'scratch', 'cache');

async function updateSupabase() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const files = fs.readdirSync(CACHE_DIR).filter(f => f.startsWith('player_') && f.endsWith('.json'));
  
  console.log(`Attempting to update Supabase with ${files.length} players...`);

  // Process in batches of 50
  for (let i = 0; i < files.length; i += 50) {
    const batchFiles = files.slice(i, i + 50);
    const playersToUpsert = batchFiles.map(file => {
      try {
        const content = fs.readFileSync(path.join(CACHE_DIR, file), 'utf-8');
        const p = JSON.parse(content);
        return {
          id: String(p.playerID || p.id),
          full_name: p.fullName || p.playerName,
          stats: p.stat || [],
          last_synced: new Date().toISOString()
          // Add other fields if needed based on the schema in src/app/actions/sync.ts
        };
      } catch (e) { return null; }
    }).filter(p => p !== null);

    const { error } = await supabase
      .from('cached_players')
      .upsert(playersToUpsert);

    if (error) {
      console.error(`Batch ${i/50 + 1} failed:`, error.message);
      if (error.code === '42P01') {
        console.error("Table 'cached_players' does not exist in public schema.");
        return;
      }
    } else {
      console.log(`Batch ${i/50 + 1} synced successfully.`);
    }
  }
}

updateSupabase();
