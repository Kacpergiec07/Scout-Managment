'use server'

import { createClient } from '@/lib/supabase/server'

export async function logUserActivity(activityData: {
  activity_type: string
  activity_data?: Record<string, any>
}) {
  console.log('logUserActivity: Attempting to log activity:', activityData.activity_type, activityData.activity_data)

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('logUserActivity: User not authenticated', userError)
      return { error: 'User not authenticated' }
    }

    console.log('logUserActivity: User authenticated, inserting activity for user:', user.id)

    const { data, error } = await supabase
      .from('user_activities')
      .insert({
        user_id: user.id,
        activity_type: activityData.activity_type,
        activity_data: activityData.activity_data || {}
      })
      .select()
      .single()

    if (error) {
      console.error('logUserActivity: Database error:', error)
      console.error('logUserActivity: Error details:', error.message, error.code, error.hint)
      return { error: error.message }
    }

    console.log('logUserActivity: Activity logged successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('logUserActivity: Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function getUserActivities(limit: number = 10) {
  console.log('getUserActivities: Fetching recent activities...')

  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error('getUserActivities: User not authenticated')
      return []
    }

    const { data: activities, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('getUserActivities: Database error:', error)
      return []
    }

    console.log('getUserActivities: Activities fetched successfully:', activities?.length || 0)
    return activities || []
  } catch (error) {
    console.error('getUserActivities: Unexpected error:', error)
    return []
  }
}

export async function getCombinedRecentActivities(limit: number = 10) {
  console.log('getCombinedRecentActivities: Fetching all recent activities...')

  try {
    // Get user activities
    const userActivities = await getUserActivities(limit)

    // Format user activities for display
    const formattedActivities = userActivities.map((activity: any) => {
      const activityData = activity.activity_data || {}

      switch (activity.activity_type) {
        case 'watchlist_add':
          return {
            id: activity.id,
            type: 'watchlist',
            action: 'Added to watchlist',
            player: activityData.player_name || 'Unknown player',
            date: new Date(activity.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            details: activityData.position ? `${activityData.position} • ${activityData.club}` : undefined
          }

        case 'watchlist_remove':
          return {
            id: activity.id,
            type: 'watchlist_remove',
            action: 'Removed from watchlist',
            player: activityData.player_name || 'Unknown player',
            date: new Date(activity.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            details: activityData.position ? `${activityData.position} • ${activityData.club}` : undefined
          }

        case 'scout_job_received':
          return {
            id: activity.id,
            type: 'scout_job',
            action: 'Scouting Assignment',
            player: activityData.club_name ? `${activityData.club_name} - ${activityData.position}` : 'Unknown assignment',
            date: new Date(activity.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            details: 'New assignment received'
          }

        case 'report_created':
          return {
            id: activity.id,
            type: 'report',
            action: 'Report Created',
            player: activityData.player_name || 'Unknown player',
            date: new Date(activity.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            details: activityData.report_type || 'Scouting report'
          }

        default:
          return {
            id: activity.id,
            type: 'general',
            action: 'Activity',
            player: activityData.description || 'Recent activity',
            date: new Date(activity.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            details: undefined
          }
      }
    })

    return formattedActivities
  } catch (error) {
    console.error('getCombinedRecentActivities: Unexpected error:', error)
    return []
  }
}