# Jobs Feature Setup Instructions

## Overview
The jobs feature allows scouts to receive AI-generated scouting assignments that are persisted in the database and displayed in their dashboard and profile.

## Database Setup

### Method 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the contents of `src/lib/supabase/jobs-schema.sql`
5. Paste and run the SQL script

### Method 2: Command Line
```bash
# Copy the SQL content and run it via Supabase CLI
supabase db reset
```

## What the Schema Creates

- **jobs table**: Stores scouting assignments with:
  - Club information (ID, name, logo)
  - League details
  - Position requirements
  - Priority levels
  - Deadlines and descriptions
  - User associations
  - Status tracking (active, completed, cancelled)

- **Row Level Security (RLS)**: Ensures users can only see their own jobs
- **Indexes**: Optimized for performance on common queries
- **Triggers**: Auto-updates `updated_at` timestamps

## Features Implemented

### 1. Job Generation
- AI-generated scouting assignments
- Real clubs from top 5 European leagues
- Randomized positions and requirements
- Priority levels (high, medium, low)

### 2. Database Persistence
- Jobs are saved to the database when generated
- Associated with authenticated users
- Survives page refreshes

### 3. Dashboard Integration
- Loads latest job on page load
- Displays job details with club logo
- Navigation to Watchlist, Leagues, and Team pages
- Animated job panel with smooth transitions

### 4. Profile Activity
- Shows recent job assignments in user profile
- Links back to dashboard
- Updates "Active Jobs" statistics
- Displays club name and position

## Testing

1. **Generate a Job**:
   - Go to `/dashboard`
   - Click "Receive New Job" button
   - Wait for AI to generate assignment
   - Verify job appears with club logo

2. **Test Persistence**:
   - Refresh the page
   - Job should still be displayed
   - Check database to confirm data was saved

3. **Verify Profile**:
   - Go to `/profile`
   - Check "Recent Activity" section
   - Job should appear with link to dashboard
   - "Active Jobs" stat should show correct count

## Database Queries

### Check Jobs Table
```sql
SELECT * FROM jobs WHERE user_id = 'your-user-id' ORDER BY created_at DESC;
```

### View User's Active Jobs
```sql
SELECT club_name, position, priority, deadline, status
FROM jobs
WHERE user_id = auth.uid() AND status = 'active'
ORDER BY created_at DESC;
```

### Count Jobs by Priority
```sql
SELECT priority, COUNT(*) as count
FROM jobs
WHERE user_id = auth.uid()
GROUP BY priority;
```

## Troubleshooting

### Jobs not persisting
- Verify database schema was applied correctly
- Check Supabase RLS policies
- Ensure user is authenticated
- Check browser console for errors

### Club logos not displaying
- Verify Statorium API is returning logo URLs
- Check image URL format in database
- Ensure images are accessible

### Jobs not showing in profile
- Verify `getRecentJobs` function is working
- Check database connection
- Ensure jobs have correct user_id

## Future Enhancements

- Job completion tracking
- Job status updates
- Job notes and progress
- Job comparison and history
- Export job reports
- Team collaboration on jobs
