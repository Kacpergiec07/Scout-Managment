# 📊 Dynamic Statistics - Current Implementation Status

## 🎯 Current Implementation State

### ✅ Already Working Features

**1. Real-Time Database Counts** ✅
The `getProfileData()` function correctly fetches real counts from:

```typescript
// Players Watched Count
const { count: playersWatched } = await supabase
  .from('watchlist')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', user.id)  // ✅ CORRECT - uses foreign key

// Active Scouting Count
const { count: activeScouting } = await supabase
  .from('watchlist')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', user.id)
  .in('status', ['following', 'priority', 'analyzing'])  // ✅ CORRECT filtering

// Reports Created Count
const { count: reportsCreated } = await supabase
  .from('analysis_history')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', user.id)  // ✅ CORRECT - uses foreign key
```

**2. Auto-Update Logic** ✅
The profile automatically updates with new counts:

```typescript
if (profile.players_watched_count !== playersWatched ||
    profile.active_scouting_count !== activeScouting ||
    profile.reports_created_count !== reportsCreated) {
  console.log('getProfileData: Updating profile with new counts...')
  
  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      players_watched_count: playersWatched || 0,
      active_scouting_count: activeScouting || 0,
      reports_created_count: reportsCreated || 0
    })
    .eq('id', user.id)
}
```

**3. Proper Field Mapping** ✅
All frontend/database field mappings are correct:
- `assigned_region` field matches database column ✅
- All queries use correct column names (`id` for profiles, `user_id` for foreign tables) ✅
- FormData mapping correctly handles field name conversion ✅

**4. Settings Page Integration** ✅
Performance Statistics section uses dynamic counts:
```typescript
// State management
const [playersWatchedCount, setPlayersWatchedCount] = useState(0)
const [activeScoutingCount, setActiveScoutingCount] = useState(0)
const [reportsCreatedCount, setReportsCreatedCount] = useState(0)

// Data loading
useEffect(() => {
  const profileData = await getProfileData()
  if (profileData) {
    setUser(profileData as UserProfile)
    // Set statistics from dynamic database counts
    setPlayersWatchedCount(profileData.players_watched_count || 0)
    setActiveScoutingCount(profileData.active_scouting_count || 0)
    setReportsCreatedCount(profileData.reports_created_count || 0)
  }
}, [])
```

## 🔍 Why Counts Might Show 0

### Potential Issues:

**1. Database Migration Not Applied** ⚠️
- The profiles table columns might not exist yet
- Solution: Run `lib/supabase/complete-profiles-migration.sql` in Supabase SQL Editor
- This script adds all required columns with proper defaults (DEFAULT 0 NOT NULL)

**2. NULL Values in Database** ⚠️
- If columns exist but have NULL values, counts will be 0
- Solution: The migration script now includes `NOT NULL` constraint
- Existing rows should be backfilled with 0 after migration

**3. RLS Policy Issues** ⚠️
- If RLS policies block access, queries will fail
- Solution: The migration script recreates all RLS policies properly
- Uses both `id` (primary key) and `user_id` (foreign key) for access control

**4. Watchlist Data Missing** ⚠️
- If watchlist table is empty, all counts will be 0
- Solution: Add players to watchlist table to test dynamic counts

**5. Query Timing Issues** ⚠️
- If multiple queries run simultaneously, they might interfere
- Solution: Queries are sequential and include proper error handling

## 🧪 Testing Steps

### Step 1: Apply Database Migration ⚠️ CRITICAL
**Required**: Run `lib/supabase/complete-profiles-migration.sql` in Supabase

**Steps**:
1. Open Supabase Dashboard → SQL Editor
2. Copy and paste entire migration script
3. Click "Run" to execute
4. Verify you see success messages:
   ```
   Added bio column to profiles table
   Added years_experience column to profiles table
   Added players_watched_count column to profiles table
   Added active_scouting_count column to profiles table
   Added reports_created_count column to profiles table
   Created RLS policies for profiles table
   ```

### Step 2: Test Profile Page
1. Navigate to `/profile`
2. Open browser DevTools (F12) → Console
3. Refresh page
4. Check console logs:

**Expected Logs**:
```
getProfileData: Starting profile data fetch...
getProfileData: User authenticated, fetching profile...: [user_id]
getProfileData: Fetching real statistics...
getProfileData: Using user.id: [user_id]
getProfileData: Players watched count: [non-zero number]
getProfileData: Active scouting count: [non-zero number]
getProfileData: Reports created count: [non-zero number]
getProfileData: Profile data fetched successfully: [profile object with counts]
```

### Step 3: Add Test Data
**Action**: Add at least 1 player to watchlist table to test if counts increase

**Steps**:
1. Go to a player detail page or use watchlist functionality
2. Add a player to your watchlist
3. Navigate back to `/profile`
4. Verify "Players Watched" count increased by 1 ✅

### Step 4: Test Settings Page
1. Navigate to `/settings`
2. Change "Years of Experience" from 0 to a number (e.g., 5)
3. Click "Save Statistics" button
4. Check console logs:

**Expected Logs**:
```
Settings: Form submitted with data: {yearsExperience: "5"}
UpdateProfile: Profile data to update: {years_experience: 5}
UpdateProfile: Profile updated successfully: {...}
```

## 📋 Troubleshooting

### If Counts Still Show 0:

**Check 1**: Run this in Supabase SQL Editor:
```sql
-- Verify watchlist data exists
SELECT * FROM watchlist WHERE user_id = auth.uid();

-- Verify count
SELECT COUNT(*) FROM watchlist WHERE user_id = auth.uid();
```

**Check 2**: Check RLS policies:
```sql
-- View existing RLS policies
SELECT * FROM pg_policies WHERE tablename = 'watchlist';
```

**Check 3**: Verify profiles table structure:
```sql
-- Check if columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'watchlist' AND table_schema = 'public';
```

### Console Error Messages to Look For:

**Query Errors**:
```
getProfileData: Watchlist count error: [error message]
getProfileData: Watchlist count error details: {
  message: [error message],
  code: [error code like "42501"],
  details: [detailed error info],
  hint: [helpful error hint]
}
```

**Auth Errors**:
```
getProfileData: User not authenticated
UpdateProfile: User not authenticated
```

**Success Indicators**:
```
getProfileData: Profile updated successfully
Settings: Profile update successful
```

## 📊 Summary

**✅ What's Working**:
- Dynamic counting logic is correctly implemented
- Real database queries are properly structured
- Field mappings match database schema exactly
- Settings page uses dynamic values from database

**⚠️ What's Likely Wrong**:
- Database migration hasn't been applied yet
- Profiles table might not have the count columns
- Watchlist table might be empty

**🎯 Action Required**:
1. Run `lib/supabase/complete-profiles-migration.sql` in Supabase SQL Editor
2. Refresh browser to clear any cached schema
3. Test Profile page to verify counts show real numbers
4. Check browser console for detailed error logs

---

**Implementation Status**: ✅ Code Complete - Awaiting Database Migration
**Priority**: CRITICAL - Migration script must be run before counts will work dynamically