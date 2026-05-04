'use server'

import { getStatoriumClient } from '@/lib/statorium/client'
import { createOpenAI } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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

export async function generateJobOfferData(
  forcedPosition?: string, 
  excludedClubIds: string[] = [],
  preselectedClub?: { id: string, name: string, logo: string, league: string, leagueId: string }
): Promise<JobOffer> {
  const client = getStatoriumClient()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const zai = createOpenAI({
    apiKey: process.env.ZAI_API_KEY,
    baseURL: process.env.ZAI_BASE_URL,
  })

  let selectedClub: any
  let selectedLeagueName: string
  let selectedLeagueId: string

  if (preselectedClub) {
    selectedClub = {
      teamID: preselectedClub.id,
      teamName: preselectedClub.name,
      teamLogo: preselectedClub.logo
    }
    selectedLeagueName = preselectedClub.league
    selectedLeagueId = preselectedClub.leagueId
  } else {
    // Always fetch current user's active jobs to prevent duplicates
    let finalExcludedIds = [...excludedClubIds]
    if (user) {
      const { data: existingJobs } = await supabase
        .from('jobs')
        .select('club_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
      
      if (existingJobs) {
        const existingIds = existingJobs.map(j => j.club_id.toString())
        finalExcludedIds = Array.from(new Set([...finalExcludedIds, ...existingIds]))
      }
    }

    // Select random league
    const selectedLeague = LEAGUE_CONFIGS[Math.floor(Math.random() * LEAGUE_CONFIGS.length)]
    selectedLeagueName = selectedLeague.name
    selectedLeagueId = selectedLeague.id

    // Fetch standings to get clubs
    let clubs: any[] = []
    try {
      const allClubs = await client.getStandings(selectedLeague.id)
      // Filter out excluded clubs
      clubs = allClubs.filter(c => !finalExcludedIds.includes(c.teamID.toString()))
      
      // If all clubs in this league are excluded, fallback to all clubs
      if (clubs.length === 0) {
        clubs = allClubs
      }
    } catch (error) {
      console.error('Error fetching standings:', error)
    }

    // Select random club from standings
    selectedClub = clubs.length > 0
      ? clubs[Math.floor(Math.random() * clubs.length)]
      : { teamID: '1', teamName: 'FC Unknown', teamLogo: '' }
  }

  // Determine suggested priority based on club prestige
  let suggestedPriority = 'medium'
  const eliteClubs = [
    'Real Madrid', 'PSG', 'Paris Saint-Germain', 'Manchester City', 'Bayern', 'Liverpool', 
    'Barcelona', 'Inter', 'Arsenal', 'Manchester United', 'Chelsea', 'Juventus', 'Milan'
  ]
  const midTierClubs = [
    'Monaco', 'Leverkusen', 'Lazio', 'Roma', 'Aston Villa', 'Newcastle', 'Dortmund', 
    'Atletico', 'Napoli', 'Tottenham', 'Benfica', 'Porto', 'Ajax', 'Leipzig', 'Sporting',
    'Feyenoord', 'PSV', 'West Ham', 'Brighton', 'Sevilla', 'Real Sociedad', 'Atalanta', 'Fiorentina'
  ]
  
  const clubName = selectedClub.teamName.toLowerCase()
  if (eliteClubs.some(ec => clubName.toLowerCase().includes(ec.toLowerCase()))) {
    suggestedPriority = 'high'
  } else if (midTierClubs.some(mc => clubName.toLowerCase().includes(mc.toLowerCase()))) {
    suggestedPriority = 'medium'
  } else {
    suggestedPriority = 'low'
  }

  // Generate job details using AI
  const prompt = `
    You are a professional football scout manager. Generate a realistic job offer for a scout.

    Selected club: ${selectedClub.teamName} from ${selectedLeagueName}
    Available positions: ${POSITIONS.join(', ')}
    Target position: ${forcedPosition || 'Any high-demand role (Striker, Winger, Defender, or Midfielder)'}

    Generate a job offer with:
    1. A specific position the club needs to reinforce. ${forcedPosition ? `CRITICAL: You MUST use "${forcedPosition}".` : "IMPORTANT: Prioritize 'Striker', 'Winger', 'Defender', or 'Central Midfielder'."}
    2. 2-5 specific requirements (age range, nationality preferences, playing style, etc.)
    3. A brief 2-sentence description of what the club is looking for
    4. Priority level: You MUST use "${suggestedPriority}".

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

    const jsonMatch = result.text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      aiResponse = JSON.parse(jsonMatch[0])
    }
  } catch (error) {
    console.error('AI generation error:', error)
    aiResponse = {
      position: POSITIONS[Math.floor(Math.random() * POSITIONS.length)],
      requirements: ['Age 20-25', 'Good technical ability', 'Team player'],
      description: 'Club is looking for talented young players to strengthen the squad.',
      priority: 'medium'
    }
  }

  const deadline = new Date()
  deadline.setDate(deadline.getDate() + Math.floor(Math.random() * 14) + 14)

  return {
    id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    club: {
      id: selectedClub.teamID,
      name: selectedClub.teamName,
      logo: selectedClub.teamLogo || '',
      league: selectedLeagueName,
      leagueId: selectedLeagueId
    },
    position: aiResponse.position || POSITIONS[Math.floor(Math.random() * POSITIONS.length)],
    requirements: aiResponse.requirements || ['Good technical skills', 'Team player', 'Professional attitude'],
    priority: aiResponse.priority || 'medium',
    deadline: deadline.toISOString().split('T')[0],
    description: aiResponse.description || 'Scout needed to identify talented players for this position.'
  }
}

async function saveJobToDb(jobData: JobOffer): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    const { data, error } = await supabase.from('jobs').insert({
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
    }).select().single()

    if (error) {
      console.error('Error saving job to database:', error)
      return { success: false, error: error.message }
    }

    // Revalidate paths to refresh cache
    revalidatePath('/dashboard')
    revalidatePath('/scout-jobs')

    return { success: true, id: data.id }
  } catch (error: any) {
    console.error('Error saving job:', error)
    return { success: false, error: error.message }
  }
}

export async function generateJobOffer(forcedPosition?: string): Promise<JobOffer> {
  const jobData = await generateJobOfferData(forcedPosition)
  const result = await saveJobToDb(jobData)
  
  if (result.success && result.id) {
    return { ...jobData, id: result.id }
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

    const newJob = await generateJobOfferData()
    return { success: true, job: newJob }
  } catch (error) {
    console.error('Error in generateDraftJobAction:', error)
    return { success: false, error: 'Failed to generate draft job' }
  }
}

export async function generatePackOfJobsAction(): Promise<{ success: boolean; jobs?: JobOffer[]; error?: string }> {
  try {
    const client = getStatoriumClient()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    const pickedClubIds: string[] = []

    // 1. Fetch existing active jobs to avoid duplicates
    if (user) {
      const { data: existingJobs } = await supabase
        .from('jobs')
        .select('club_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
      if (existingJobs) {
        pickedClubIds.push(...existingJobs.map(j => j.club_id.toString()))
      }
    }

    // 2. Pre-select 4 unique clubs with specific ratio: 1 Elite, 1 Mid, 2 Standard
    const targetClubs: any[] = []
    const positions = ['Defender', 'Central Midfielder', 'Winger', 'Striker']
    
    const ELITE_LIST = ['Real Madrid', 'PSG', 'Paris Saint-Germain', 'Manchester City', 'Bayern', 'Liverpool', 'Barcelona', 'Inter', 'Arsenal']
    const MID_LIST = ['Monaco', 'Leverkusen', 'Lazio', 'Roma', 'Aston Villa', 'Newcastle', 'Dortmund', 'Atletico', 'Napoli', 'Milan', 'Tottenham', 'Benfica', 'Porto', 'Ajax']

    const findClubInTier = async (tier: 'elite' | 'mid' | 'standard', count: number) => {
      let found = 0
      let attempts = 0
      while (found < count && attempts < 15) {
        attempts++
        const randomLeague = LEAGUE_CONFIGS[Math.floor(Math.random() * LEAGUE_CONFIGS.length)]
        try {
          const standings = await client.getStandings(randomLeague.id)
          const available = standings.filter(c => 
            !pickedClubIds.includes(c.teamID.toString()) && 
            !targetClubs.some(tc => tc.id === c.teamID.toString())
          )

          let candidates = []
          if (tier === 'elite') {
            candidates = available.filter(c => ELITE_LIST.some(e => c.teamName.toLowerCase().includes(e.toLowerCase())))
          } else if (tier === 'mid') {
            candidates = available.filter(c => MID_LIST.some(m => c.teamName.toLowerCase().includes(m.toLowerCase())))
          } else {
            candidates = available.filter(c => 
              !ELITE_LIST.some(e => c.teamName.toLowerCase().includes(e.toLowerCase())) &&
              !MID_LIST.some(m => c.teamName.toLowerCase().includes(m.toLowerCase()))
            )
          }

          if (candidates.length > 0) {
            const club = candidates[Math.floor(Math.random() * candidates.length)]
            targetClubs.push({
              id: club.teamID.toString(),
              name: club.teamName,
              logo: club.teamLogo,
              league: randomLeague.name,
              leagueId: randomLeague.id
            })
            found++
          }
        } catch (e) { console.error(e) }
      }
    }

    // Pick 1 Elite
    await findClubInTier('elite', 1)
    // Pick 1 Mid
    await findClubInTier('mid', 1)
    // Pick 2 Standard
    await findClubInTier('standard', 2)

    // Fallback if we couldn't find specific tiers (fill to 4)
    if (targetClubs.length < 4) {
      let attempts = 0
      while (targetClubs.length < 4 && attempts < 5) {
        attempts++
        const randomLeague = LEAGUE_CONFIGS[Math.floor(Math.random() * LEAGUE_CONFIGS.length)]
        const standings = await client.getStandings(randomLeague.id)
        const club = standings.find(c => !targetClubs.some(tc => tc.id === c.teamID.toString()))
        if (club) targetClubs.push({ id: club.teamID.toString(), name: club.teamName, logo: club.teamLogo, league: randomLeague.name, leagueId: randomLeague.id })
      }
    }

    // 3. Generate jobs in PARALLEL using pre-selected unique clubs
    const jobPromises = targetClubs.map((club, index) => 
      generateJobOfferData(positions[index], [], club)
    )
    const jobs = await Promise.all(jobPromises)

    return { success: true, jobs }
  } catch (error) {
    console.error('Error in generatePackOfJobsAction:', error)
    return { success: false, error: 'Failed to generate pack of jobs' }
  }
}

export async function acceptJobAction(job: JobOffer): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await saveJobToDb(job)
    
    if (!result.success) {
      return { success: false, error: result.error }
    }

    revalidatePath('/scout-jobs')
    return { success: true }
  } catch (error) {
    console.error('Error in acceptJobAction:', error)
    return { success: false, error: 'Failed to accept job' }
  }
}

export async function generateNewJobAction(): Promise<{ success: boolean; job?: JobOffer; error?: string }> {
  try {
    const newJob = await generateJobOffer()
    return { success: true, job: newJob }
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
export async function generateEliteJobsAction(): Promise<{ success: boolean; jobs?: JobOffer[]; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    let existingClubIds: string[] = []

    if (user) {
      const { data: existingJobs } = await supabase
        .from('jobs')
        .select('club_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
      if (existingJobs) {
        existingClubIds = existingJobs.map(j => j.club_id.toString())
      }
    }

    const eliteClubs = [
      { 
        id: '37', 
        name: 'Real Madrid', 
        logo: 'https://api.statorium.com/media/bearleague/bl155800057030.png',
        leagueId: '558',
        league: 'La Liga'
      },
      { 
        id: '66', 
        name: 'PSG', 
        logo: 'https://api.statorium.com/media/bearleague/ct66.png',
        leagueId: '519',
        league: 'Ligue 1'
      }
    ].filter(club => !existingClubIds.includes(club.id))

    if (eliteClubs.length === 0) {
      return { success: false, error: 'You already have active missions for all elite clubs!' }
    }

    const jobPromises = eliteClubs.map(async (club) => {
      const pos = POSITIONS[Math.floor(Math.random() * POSITIONS.length)]
      // Pass the club as preselectedClub to avoid fetching standings (MASSIVE SPEEDUP)
      const jobData = await generateJobOfferData(pos, [], club)
      
      return {
        ...jobData,
        priority: 'high' as const,
        description: club.name === 'Real Madrid' 
          ? 'The most successful club in European history is looking for the next Galactico. Only elite profiles will be considered.'
          : 'Paris Saint-Germain is building a new era of dominance. We require world-class talent to conquer the Champions League.'
      }
    })

    const jobs = await Promise.all(jobPromises)
    return { success: true, jobs }
  } catch (error) {
    console.error('Error in generateEliteJobsAction:', error)
    return { success: false, error: 'Failed to generate elite jobs' }
  }
}
