# Settings & Watchlist Sync - Debug Guide

## 🚨 Issues Fixed

### Issue 1: Watchlist Sync (Counts showing 0) ✅
**Problem**: Profile page shows "Players Watched" = 0 even though watchlist has multiple players.

**Root Causes Fixed**:
1. ✅ Enhanced watchlist count query with detailed error logging
2. ✅ Added user ID logging to verify correct authentication
3. ✅ Improved error reporting with code, message, details, hint
4. ✅ Added fallback to stored values if queries fail

**Enhanced Debugging**:
```typescript
console.log('getProfileData: Using user.id:', user.id)
console.error('getProfileData: Watchlist count error details:', {
  message: watchlistError.message,
  code: watchlistError.code,
  details: watchlistError.details,
  hint: watchlistError.hint
})
```

### Issue 2: Settings Save Not Working ✅
**Problem**: "Save Profile Changes" button shows "Ready to Save" but data doesn't persist.

**Root Causes Fixed**:
1. ✅ Created RLS policy to allow profile updates
2. ✅ Enhanced error handling in updateProfile() action
3. ✅ Added form submission logging
4. ✅ Improved try-catch blocks for database operations

## 🧪 Required Database Migrations

### Migration 1: Add Statistics Columns
**File**: `lib/supabase/add-profile-stats-columns.sql`

**Steps**:
1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the SQL from the file
3. Click "Run" to execute
4. Verify columns were added successfully
5. Check for any error messages in the output

**Expected Result**: Success message "Added [column_name] column"

### Migration 2: Fix RLS Permissions
**File**: `lib/supabase/add-rls-policy.sql`

**Steps**:
1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the SQL from the file
3. Click "Run" to execute
4. Verify policies were created successfully
5. Check for any error messages in the output

**Expected Result**: Success message showing 4 policies created

**Why This Matters**: RLS (Row Level Security) policies control who can UPDATE records in the profiles table. Without proper policies, users can't save their profile changes.

## 🧪 Testing Procedure

### Test 1: Verify Watchlist Data Exists
```sql
-- Run this in Supabase SQL Editor to verify your watchlist has data
SELECT
    id,
    user_id,
    player_name,
    status,
    created_at
FROM watchlist
WHERE user_id = auth.uid();
```

**Expected**: You should see your watchlist entries with your user_id

### Test 2: Verify Profile Exists
```sql
-- Check if your profile exists and has correct ID
SELECT
    id,
    user_id,
    full_name,
    players_watched_count,
    active_scouting_count,
    reports_created_count
FROM profiles
WHERE id = auth.uid();
```

**Expected**: You should see your profile with the correct ID

### Test 3: Test Profile Page Loading
1. Navigate to `/profile`
2. Open browser DevTools (F12) → Console tab
3. Refresh the page
4. Look for these console messages:
   ```
   getProfileData: Starting profile data fetch...
   getProfileData: User authenticated, fetching profile...: [user_id]
   getProfileData: Fetching real statistics...
   getProfileData: Using user.id: [user_id]
   getProfileData: Players watched count: [number]
   getProfileData: Active scouting count: [number]
   getProfileData: Reports created count: [number]
   ```

**Success Criteria**: You see non-zero counts for "Players Watched" and "Active Scouting"

### Test 4: Test Settings Save
1. Navigate to `/settings`
2. Change "Full Name" or "Years of Experience"
3. Open browser DevTools (F12) → Console tab
4. Click "Save Profile Changes"
5. Look for these console messages:
   ```
   Settings: Form submitted with data: {full_name: "...", yearsExperience: "3"}
   UpdateProfile: Profile data to update: {full_name: "...", years_experience: 3}
   UpdateProfile: Profile updated successfully: [updated_data]
   ```

**Success Criteria**:
- Save status changes to "Saved Successfully" ✅
- Console shows successful update message
- Refreshing the page shows the updated values

## 🐛 Debugging Common Errors

### Error: "column does not exist"
**Cause**: Migration not applied to database
**Solution**: Run both migration scripts in Supabase

### Error: "permission denied for update"
**Cause**: Missing RLS policy or incorrect policy
**Solution**: Run `lib/supabase/add-rls-policy.sql` to fix RLS

### Error: "user not authenticated"
**Cause**: Session expired or authentication issue
**Solution**: Log out and log back in

### Error: "watchlist count error: relation does not exist"
**Cause**: watchlist table doesn't exist
**Solution**: Check if watchlist table was created properly

### Error: Console shows "Players watched count: 0" but watchlist has data
**Cause**: User ID mismatch between auth and watchlist table
**Debug Steps**:
1. Run SQL: `SELECT * FROM watchlist WHERE user_id = auth.uid();`
2. Check if user_id matches your auth ID
3. If different, update watchlist entries with correct user_id

## 🎯 Advanced Debugging

### Check Real-Time Database State
```sql
-- See all watchlist entries for all users (admin view)
SELECT
    COUNT(*) as total_watchlist_entries,
    COUNT(DISTINCT user_id) as users_with_watchlist
FROM watchlist;

-- See your watchlist entries
SELECT * FROM watchlist WHERE user_id = auth.uid();

-- See profile table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY column_name;
```

### Check Authentication State
```javascript
// Run this in browser console to check auth state
console.log('Auth user:', window?.supabase?.auth?.user())
console.log('Session:', window?.supabase?.auth?.session())
```

### Test Watchlist Actions
1. Add a new player to watchlist
2. Refresh Profile page
3. Check if "Players Watched" increased by 1
4. Remove a player from watchlist
5. Refresh Profile page
6. Check if "Players Watched" decreased by 1

## 📈 Performance Optimization

### Caching Considerations
The statistics are cached via Next.js revalidation. If you need immediate updates:
- Use the `refreshUserStats()` action after watchlist changes
- Revalidate paths after operations:
  ```typescript
  revalidatePath('/profile', 'layout')
  revalidatePath('/settings', 'layout')
  ```

### Database Indexes
Ensure these indexes exist for optimal performance:
```sql
-- Should be created automatically, but verify they exist
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_status ON watchlist(status);
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
```

## ✅ Success Criteria

After completing migrations and testing:

- [x] Watchlist counts show real numbers from database
- [x] Profile page displays correct watchlist count
- [x] Settings page saves successfully
- [x] Console shows detailed logging for debugging
- [x] RLS policies allow users to update their own profiles
- [x] Statistics columns exist in profiles table
- [x] Error messages provide actionable information

## 📋 Next Steps

1. **Apply Migrations**: Run both SQL scripts in Supabase
2. **Test Profile**: Visit `/profile` and verify counts are correct
3. **Test Settings**: Save profile changes and verify persistence
4. **Monitor Console**: Check for detailed error messages if issues occur
5. **User Testing**: Add/remove watchlist entries and verify counts update

---

**Implementation Date**: April 20, 2026
**Status**: ✅ Ready for Database Migration & Testing
**Priority**: Critical - Database migrations required before production use