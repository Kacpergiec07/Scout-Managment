'use server'

import { getStatoriumClient } from '@/lib/statorium/client'
import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'

interface JobOffer {
  id: string
  club: {
    id: string
    name: string
    logo: string
    league: string
    leagueId: string
  }
  position: string
  requirements: string[]
  priority: 'high' | 'medium' | 'low'
  deadline: string
  description: string
}

const LEAGUE_CONFIGS = [
  { id: '515', name: 'Premier League', logo: 'https://cdn.futwiz.com/assets/img/fc24/leagues/13.png' },
  { id: '521', name: 'Bundesliga', logo: 'https://cdn.futwiz.com/assets/img/fc24/leagues/19.png' },
  { id: '558', name: 'La Liga', logo: 'https://cdn.futwiz.com/assets/img/fc24/leagues/53.png' },
  { id: '511', name: 'Serie A', logo: 'https://cdn.futwiz.com/assets/img/fc24/leagues/31.png' },
  { id: '519', name: 'Ligue 1', logo: 'https://cdn.futwiz.com/assets/img/fc24/leagues/16.png' }
]

const POSITIONS = [
  'Goalkeeper',
  'Defender',
  'Defensive Midfielder',
  'Central Midfielder',
  'Attacking Midfielder',
  'Winger',
  'Striker'
]

export async function generateJobOffer(forcedPosition?: string): Promise<JobOffer> {
  const client = getStatoriumClient()
  const zai = createOpenAI({
    apiKey: process.env.ZAI_API_KEY,
    baseURL: process.env.ZAI_BASE_URL,
  })

  // Select random league
  const selectedLeague = LEAGUE_CONFIGS[Math.floor(Math.random() * LEAGUE_CONFIGS.length)]

  // Fetch standings to get clubs
  let clubs: any[] = []
  try {
    clubs = await client.getStandings(selectedLeague.id)
  } catch (error) {
    console.error('Error fetching standings:', error)
    // Fallback to empty array if API fails
  }

  // Select random club from standings
  const selectedClub = clubs.length > 0
    ? clubs[Math.floor(Math.random() * clubs.length)]
    : { teamID: '1', teamName: 'FC Unknown', teamLogo: '' }

  // Generate job details using AI
  const prompt = `
    You are a professional football scout manager. Generate a realistic job offer for a scout.

    Selected club: ${selectedClub.teamName} from ${selectedLeague.name}
    Available positions: ${POSITIONS.join(', ')}
    Target position: ${forcedPosition || 'Any high-demand role (Striker, Winger, Defender, or Midfielder)'}

    Generate a job offer with:
    1. A specific position the club needs to reinforce. ${forcedPosition ? `CRITICAL: You MUST use "${forcedPosition}".` : "IMPORTANT: Prioritize 'Striker', 'Winger', 'Defender', or 'Central Midfielder'."}
    2. 3-4 specific requirements (age range, nationality preferences, playing style, etc.)
    3. A brief 2-sentence description of what the club is looking for
    4. Priority level (high/medium/low)

    Return ONLY valid JSON in this exact format:
    {
      "position": "Striker",
      "requirements": ["Age 22-26", "European passport", "High pressing intensity", "Good aerial ability"],
      "description": "Club needs a target man who can hold up play and finish chances in the box. Must excel in aerial duels and link-up play.",
      "priority": "high"
    }
  `

  let aiResponse: any = {}
  try {
    const result = await generateText({
      model: zai.chat(process.env.ZAI_MODEL || 'glm-4.7'),
      prompt: prompt,
      temperature: 0.8,
    })

    // Parse AI response
    const jsonMatch = result.text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      aiResponse = JSON.parse(jsonMatch[0])
    }
  } catch (error) {
    console.error('AI generation error:', error)
    // Fallback to default values
    aiResponse = {
      position: POSITIONS[Math.floor(Math.random() * POSITIONS.length)],
      requirements: ['Age 20-25', 'Good technical ability', 'Team player'],
      description: 'Club is looking for talented young players to strengthen the squad.',
      priority: 'medium'
    }
  }

  // Calculate deadline (2-4 weeks from now)
  const deadline = new Date()
  deadline.setDate(deadline.getDate() + Math.floor(Math.random() * 14) + 14)

  const jobData = {
    id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    club: {
      id: selectedClub.teamID,
      name: selectedClub.teamName,
      logo: selectedClub.teamLogo || '',
      league: selectedLeague.name,
      leagueId: selectedLeague.id
    },
    position: aiResponse.position || POSITIONS[Math.floor(Math.random() * POSITIONS.length)],
    requirements: aiResponse.requirements || ['Good technical skills', 'Team player', 'Professional attitude'],
    priority: aiResponse.priority || 'medium',
    deadline: deadline.toISOString().split('T')[0],
    description: aiResponse.description || 'Scout needed to identify talented players for this position.'
  }

  // Save job to database
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { error } = await supabase.from('jobs').insert({
        user_id: user.id,
        club_id: jobData.club.id,
        club_name: jobData.club.name,
        club_logo: jobData.club.logo,
        league_id: jobData.club.leagueId,
        league_name: jobData.club.league,
        position: jobData.position,
        requirements: jobData.requirements,
        priority: jobData.priority,
        deadline: jobData.deadline,
        description: jobData.description,
        status: 'active'
      })

      if (error) {
        console.error('Error saving job to database:', error)
      }
    }
  } catch (error) {
    console.error('Error saving job:', error)
  }

  return jobData
}

export async function getRecentJobs(limit: number = 4): Promise<JobOffer[]> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return []
    }

    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching jobs:', error)
      return []
    }

    return jobs.map((job: any) => ({
      id: job.id,
      club: {
        id: job.club_id,
        name: job.club_name,
        logo: job.club_logo || '',
        league: job.league_name,
        leagueId: job.league_id
      },
      position: job.position,
      requirements: Array.isArray(job.requirements) ? job.requirements : [],
      priority: job.priority,
      deadline: job.deadline,
      description: job.description
    }))
  } catch (error) {
    console.error('Error fetching recent jobs:', error)
    return []
  }
}

export async function getLatestJob(): Promise<JobOffer | null> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)

    if (error || !jobs || jobs.length === 0) {
      return null
    }

    const job = jobs[0]
    return {
      id: job.id,
      club: {
        id: job.club_id,
        name: job.club_name,
        logo: job.club_logo || '',
        league: job.league_name,
        leagueId: job.league_id
      },
      position: job.position,
      requirements: Array.isArray(job.requirements) ? job.requirements : [],
      priority: job.priority,
      deadline: job.deadline,
      description: job.description
    }
  } catch (error) {
    console.error('Error fetching latest job:', error)
    return null
  }
}

export async function cancelJobAction(jobId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { error } = await supabase
      .from('jobs')
      .update({ status: 'cancelled' })
      .eq('id', jobId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error cancelling job:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in cancelJobAction:', error)
    return { success: false, error: 'Failed to cancel job' }
  }
}

export async function generateDraftJobAction(): Promise<{ success: boolean; job?: JobOffer; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const newJob = await generateJobOffer()
    return { success: true, job: newJob }
  } catch (error) {
    console.error('Error in generateDraftJobAction:', error)
    return { success: false, error: 'Failed to generate draft job' }
  }
}

export async function generatePackOfJobsAction(): Promise<{ success: boolean; jobs?: JobOffer[]; error?: string }> {
  try {
    const positions = ['Defender', 'Central Midfielder', 'Winger', 'Striker']
    const jobs: JobOffer[] = []

    for (const pos of positions) {
      const job = await generateJobOffer(pos)
      jobs.push(job)
    }

    return { success: true, jobs }
  } catch (error) {
    console.error('Error in generatePackOfJobsAction:', error)
    return { success: false, error: 'Failed to generate pack of jobs' }
  }
}

export async function acceptJobAction(job: JobOffer): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { error } = await supabase
      .from('jobs')
      .insert({
        user_id: user.id,
        club_id: job.club.id,
        club_name: job.club.name,
        club_logo: job.club.logo,
        league_name: job.club.league,
        league_id: job.club.leagueId,
        position: job.position,
        requirements: job.requirements,
        priority: job.priority,
        deadline: job.deadline,
        description: job.description,
        status: 'active'
      })

    if (error) {
      console.error('Error inserting accepted job:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in acceptJobAction:', error)
    return { success: false, error: 'Failed to accept job' }
  }
}

export async function generateNewJobAction(): Promise<{ success: boolean; job?: JobOffer; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const newJob = await generateJobOffer()
    
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        user_id: user.id,
        club_id: newJob.club.id,
        club_name: newJob.club.name,
        club_logo: newJob.club.logo,
        league_name: newJob.club.league,
        league_id: newJob.club.leagueId,
        position: newJob.position,
        requirements: newJob.requirements,
        priority: newJob.priority,
        deadline: newJob.deadline,
        description: newJob.description,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting new job:', error)
      return { success: false, error: error.message }
    }

    return { 
      success: true, 
      job: {
        id: data.id,
        club: {
          id: data.club_id,
          name: data.club_name,
          logo: data.club_logo || '',
          league: data.league_name,
          leagueId: data.league_id
        },
        position: data.position,
        requirements: data.requirements,
        priority: data.priority,
        deadline: data.deadline,
        description: data.description
      }
    }
  } catch (error) {
    console.error('Error in generateNewJobAction:', error)
    return { success: false, error: 'Failed to generate new job' }
  }
}

export async function getJobsByClubAction(clubId: string): Promise<JobOffer[]> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', user.id)
      .eq('club_id', clubId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching jobs by club:', error)
      return []
    }

    return jobs.map((job: any) => ({
      id: job.id,
      club: {
        id: job.club_id,
        name: job.club_name,
        logo: job.club_logo || '',
        league: job.league_name,
        leagueId: job.league_id
      },
      position: job.position,
      requirements: Array.isArray(job.requirements) ? job.requirements : [],
      priority: job.priority,
      deadline: job.deadline,
      description: job.description
    }))
  } catch (error) {
    console.error('Error fetching jobs by club:', error)
    return []
  }
}

export async function deleteJob(jobId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting job:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting job:', error)
    return { success: false, error: 'Failed to delete job' }
  }
}

export async function completeJob(jobId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { error } = await supabase
      .from('jobs')
      .update({ status: 'completed' })
      .eq('id', jobId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error completing job:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error completing job:', error)
    return { success: false, error: 'Failed to complete job' }
  }
}
