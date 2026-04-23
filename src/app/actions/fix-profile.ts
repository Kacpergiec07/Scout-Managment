'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Robust profile fix function that handles multiple schema scenarios
 * This will work regardless of whether the database has old or new schema
 */
export async function fixUserProfile() {
  console.log('fixUserProfile: Starting profile fix...')

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('fixUserProfile: User not authenticated')
      return { error: 'User not authenticated' }
    }

    console.log('fixUserProfile: User authenticated:', user.id, user.email)

    // Step 1: Try to fetch existing profile using multiple possible schemas
    let profile = null
    let profileError = null

    // Try the new schema first (id = user.id)
    try {
      const result = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (result.data && !result.error) {
        profile = result.data
        console.log('fixUserProfile: Found profile using id schema:', profile)
      } else if (result.error) {
        profileError = result.error
        console.log('fixUserProfile: No profile found with id schema, trying user_id...')
      }
    } catch (err) {
      console.log('fixUserProfile: Error with id schema, trying user_id...')
    }

    // Try the old schema (user_id = user.id)
    if (!profile) {
      try {
        const result = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (result.data && !result.error) {
          profile = result.data
          console.log('fixUserProfile: Found profile using user_id schema:', profile)

          // Fix the schema by updating to use id instead of user_id
          console.log('fixUserProfile: Converting profile to new schema...')
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              id: user.id,
              email: user.email
            })
            .eq('user_id', user.id)

          if (updateError) {
            console.error('fixUserProfile: Error converting profile:', updateError)
          } else {
            console.log('fixUserProfile: Profile converted successfully')
            // Fetch again with new schema
            const refetched = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single()
            if (refetched.data) {
              profile = refetched.data
            }
          }
        }
      } catch (err) {
        console.log('fixUserProfile: No profile found with user_id schema either')
      }
    }

    // Step 2: If still no profile, create one with comprehensive field coverage
    if (!profile) {
      console.log('fixUserProfile: No existing profile found, creating new one...')

      const profileData: any = {
        // Try both possible primary key structures
        id: user.id,
        user_id: user.id, // Include both for compatibility

        // Core user data
        full_name: user.email?.split('@')[0] || 'New User',
        email: user.email,
        role: 'Scout',
        assigned_region: 'Global',
        bio: null,
        avatar_url: null,

        // Statistics
        years_experience: 0,
        players_watched_count: 0,
        active_scouting_count: 0,
        reports_created_count: 0,

        // Preferences
        notification_preferences: {
          email_alerts: true,
          push_notifications: false,
          player_updates: true,
          transfer_alerts: true,
          weekly_reports: false
        }
      }

      console.log('fixUserProfile: Creating profile with data:', profileData)

      try {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single()

        if (createError) {
          console.error('fixUserProfile: Profile creation error:', createError)

          // Try creating without user_id if that's the issue
          const minimalData = { ...profileData }
          delete minimalData.user_id

          const { data: retryProfile, error: retryError } = await supabase
            .from('profiles')
            .insert(minimalData)
            .select()
            .single()

          if (retryError) {
            console.error('fixUserProfile: Retry also failed:', retryError)
            return { error: `Failed to create profile: ${retryError.message}` }
          }

          profile = retryProfile
        } else {
          profile = newProfile
        }

        console.log('fixUserProfile: Profile created successfully:', profile)

      } catch (error) {
        console.error('fixUserProfile: Profile creation failed:', error)
        return { error: 'Failed to create profile' }
      }
    }

    // Step 3: Ensure the profile has all required fields
    if (profile) {
      const updates: any = {}

      // Check and add missing fields
      if (!profile.email && user.email) {
        updates.email = user.email
      }
      if (!profile.assigned_region) {
        updates.assigned_region = 'Global'
      }
      if (!profile.role) {
        updates.role = 'Scout'
      }
      if (profile.bio === undefined) {
        updates.bio = null
      }
      if (profile.avatar_url === undefined) {
        updates.avatar_url = null
      }

      // Update statistics to ensure they exist
      if (profile.years_experience === undefined) {
        updates.years_experience = 0
      }
      if (profile.players_watched_count === undefined) {
        updates.players_watched_count = 0
      }
      if (profile.active_scouting_count === undefined) {
        updates.active_scouting_count = 0
      }
      if (profile.reports_created_count === undefined) {
        updates.reports_created_count = 0
      }

      // Apply updates if needed
      if (Object.keys(updates).length > 0) {
        console.log('fixUserProfile: Updating profile with missing fields:', updates)

        const { error: updateError } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id)

        if (updateError) {
          console.error('fixUserProfile: Error updating profile:', updateError)
        } else {
          console.log('fixUserProfile: Profile updated successfully')
        }
      }

      // Step 4: Refresh statistics from actual data
      console.log('fixUserProfile: Refreshing statistics...')

      const { count: totalWatched } = await supabase
        .from('watchlist')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      const { count: activeScouting } = await supabase
        .from('watchlist')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('status', ['following', 'priority', 'analyzing'])

      const { count: totalReports } = await supabase
        .from('analysis_history')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      const statsUpdate = {
        players_watched_count: totalWatched || 0,
        active_scouting_count: activeScouting || 0,
        reports_created_count: totalReports || 0
      }

      console.log('fixUserProfile: Updating statistics:', statsUpdate)

      const { error: statsError } = await supabase
        .from('profiles')
        .update(statsUpdate)
        .eq('id', user.id)

      if (statsError) {
        console.error('fixUserProfile: Error updating statistics:', statsError)
      } else {
        console.log('fixUserProfile: Statistics updated successfully')
      }
    }

    return {
      success: true,
      message: 'Profile fixed successfully! Please refresh your browser.',
      profile: profile
    }

  } catch (error) {
    console.error('fixUserProfile: Unexpected error:', error)
    return { error: 'An unexpected error occurred while fixing profile' }
  }
}