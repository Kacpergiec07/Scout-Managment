"use client";

import { useEffect, useState, useMemo, useRef, Suspense, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAllTop5ClubsAction } from "@/app/actions/statorium";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";

const FootballGlobe = dynamic(() => import("@/components/ui/football-globe").then(mod => mod.FootballGlobe), { 
    ssr: false,
    loading: () => <div className="w-full h-full bg-secondary/5 animate-pulse rounded-full" />
});

interface Club {
  id: string;
  name: string;
  logo: string;
  seasonId: string;
}

interface League {
  id: string;
  name: string;
  logo: string;
  flag: string;
  country: string;
  color: string;
}
const TOP_LEAGUES: League[] = [
  {
    id: "515",
    name: "Premier League",
    logo: "https://cdn.futwiz.com/assets/img/fc24/leagues/13.png",
    flag: "https://flagcdn.com/w1280/gb.png",
    country: "England",
    color: "rgba(128, 0, 255, 0.4)",
  },
  {
    id: "558",
    name: "La Liga",
    logo: "https://cdn.futwiz.com/assets/img/fc24/leagues/53.png",
    flag: "https://flagcdn.com/w1280/es.png",
    country: "Spain",
    color: "rgba(255, 30, 45, 0.4)",
  },
  {
    id: "511",
    name: "Serie A",
    logo: "https://cdn.futwiz.com/assets/img/fc24/leagues/31.png",
    flag: "https://flagcdn.com/w1280/it.png",
    country: "Italy",
    color: "rgba(0, 100, 255, 0.4)",
  },
  {
    id: "521",
    name: "Bundesliga",
    logo: "https://cdn.futwiz.com/assets/img/fc24/leagues/19.png",
    flag: "https://flagcdn.com/w1280/de.png",
    country: "Germany",
    color: "rgba(255, 0, 0, 0.4)",
  },
  {
    id: "519",
    name: "Ligue 1",
    logo: "https://cdn.futwiz.com/assets/img/fc24/leagues/16.png",
    flag: "https://flagcdn.com/w1280/fr.png",
    country: "France",
    color: "rgba(200, 255, 50, 0.4)",
  },
];

export function LeagueGalaxy() {
  const router = useRouter();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredLeague, setHoveredLeague] = useState<League | null>(null);
  const [dimensions, setDimensions] = useState({ width: 1400, height: 900 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getAllTop5ClubsAction();
        setClubs([...(data as Club[])].sort(() => Math.random() - 0.5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    const obs = new ResizeObserver((entries) => {
      if (entries[0] && entries[0].contentRect.width > 0) {
        const { width, height } = entries[0].contentRect;
        setDimensions({ width, height });
      }
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const clubOffsets = useMemo(() => {
    if (!clubs.length) return [];
    
    const offsets: any[] = [];
    const minDistance = 5.5; // Reduced to guarantee that all ~100 clubs fit securely
    const edgePaddingX = 4; 
    const edgePaddingY = 10; 
    const maxAttempts = 500; // Increased attempts to maximize placement success
    
    for (let i = 0; i < clubs.length; i++) {
        let bestX = 0, bestY = 0;
        let found = false;
        
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const x = edgePaddingX + Math.random() * (100 - edgePaddingX * 2);
            const y = edgePaddingY + Math.random() * (100 - edgePaddingY * 2);
            
            // 1. Central exclusion (ellipse)
            const dx = (x - 50) * 1.5;
            const dy = (y - 50);
            const distToCenter = Math.sqrt(dx * dx + dy * dy);
            if (distToCenter < 35) continue; 
            
            // 2. Collision check
            let conflict = false;
            for (const other of offsets) {
                const odx = x - parseFloat(other.x);
                const ody = y - parseFloat(other.y);
                // Euclidean distance check to prevent overlaps
                if (Math.sqrt(odx * odx + ody * ody) < minDistance) {
                    conflict = true;
                    break;
                }
            }
            
            if (!conflict) {
                bestX = x;
                bestY = y;
                found = true;
                break;
            }
        }
        
        // Final fallback: if after 500 attempts we couldn't find a perfect spot,
        // we place it in the last attempted coordinates to ensure the club is present.
        if (!found) {
            bestX = edgePaddingX + Math.random() * (100 - edgePaddingX * 2);
            bestY = edgePaddingY + Math.random() * (100 - edgePaddingY * 2);
        }

        offsets.push({
            clubIdx: i,
            x: `${bestX}%`,
            y: `${bestY}%`,
            speed: 20 + Math.random() * 30,
            scale: 0.5 + Math.random() * 0.5,
            opacity: 0.6 + Math.random() * 0.4,
            driftX: (Math.random() - 0.5) * 20,
            driftY: (Math.random() - 0.5) * 20,
            delay: Math.random() * -30
        });
    }
    
    return offsets;
  }, [clubs.length]);

  // 4. Memoize background stars to prevent "flicking/reset" on re-render
  const starField = useMemo(() => {
    return [...Array(200)].map((_, i) => ({
      id: i,
      size: Math.random() * 2,
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 10
    }));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="w-10 h-10 animate-spin text-secondary mb-4" />
        <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Calibrating Galactic Sector...</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center overflow-hidden bg-background transition-colors duration-500">
      
      {/* Dynamic Background Flag Blur */}
      <AnimatePresence mode="wait">
        {hoveredLeague && (
          <motion.div
            key={hoveredLeague.id}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.3, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              backgroundImage: `url(${hoveredLeague.flag})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(60px) saturate(1.8) brightness(0.4)",
            }}
          >
            {/* Colored overlay for extra atmosphere */}
            <div 
              className="absolute inset-0 opacity-40 mix-blend-overlay" 
              style={{ backgroundColor: hoveredLeague.color }} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Star Field Background - Persistent */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        {starField.map((star) => (
          <div key={star.id} className="absolute bg-foreground/40 rounded-full animate-pulse" 
            style={{
                width: star.size + 'px', 
                height: star.size + 'px',
                top: star.top + '%', 
                left: star.left + '%',
                animationDelay: star.delay + 's'
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 z-10 flex items-center justify-center">
        
        {/* Central Space */}
        <div className="relative w-full h-full flex items-center justify-center">
            
            {/* 1. The UEFA Starball Core */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                <div className="w-[240px] h-[240px]">
                    <FootballGlobe config={{ autoRotate: true, autoRotateSpeed: 0.8 }} />
                </div>
            </div>

            {/* 2. Central Orbital Ring (Safety Orbit) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div 
                    className="absolute rounded-full border border-border/20 shadow-[0_0_40px_rgba(59,130,246,0.1)]" 
                    style={{ width: 500, height: 500 }} 
                />
            </div>

            {/* 3. The 5 Major Leagues on the Orbit - SLOW ROTATION */}
            <motion.div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-40"
                animate={hoveredLeague ? {} : { rotate: 360 }}
                transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                style={{ 
                    // Fallback to maintain current position if possible or just stop
                    animationPlayState: hoveredLeague ? 'paused' : 'running'
                }}
            >
                {TOP_LEAGUES.map((league, i) => {
                    const angleRad = (i * (360 / TOP_LEAGUES.length) - 90) * (Math.PI / 180);
                    const radius = 250; // Increased to match 500px orbit
                    const x = Math.cos(angleRad) * radius;
                    const y = Math.sin(angleRad) * radius;
                    
                    return (
                        <motion.div
                            key={league.id}
                            className="absolute flex flex-col items-center pointer-events-auto cursor-pointer group"
                            style={{ x, y }}
                            onMouseEnter={() => setHoveredLeague(league)}
                            onMouseLeave={() => setHoveredLeague(null)}
                            onClick={() => router.push(`/leagues/${league.id}`)}
                            whileHover={{ scale: 1.2 }}
                        >
                            <motion.div 
                                className="flex flex-col items-center"
                                animate={hoveredLeague ? {} : { rotate: -360 }}
                                transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                                style={{ 
                                    animationPlayState: hoveredLeague ? 'paused' : 'running'
                                }}
                            >
                                <div 
                                    className="w-20 h-20 rounded-full border-2 p-1 bg-card/80 backdrop-blur-md flex items-center justify-center transition-all duration-300 relative" 
                                    style={{ borderColor: league.color }}
                                >
                                    <Image 
                                      src={league.logo} 
                                      alt={league.name} 
                                      width={48}
                                      height={48}
                                      className="object-contain" 
                                    />
                                </div>
                                <div className="mt-2 flex flex-col items-center">
                                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-card/90 px-2 py-0.5 rounded">
                                        {league.name}
                                    </span>
                                    <span className="text-[8px] font-bold text-secondary uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity delay-75">
                                        Click to explore
                                    </span>
                                </div>
                            </motion.div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* 4. The Scattered Club Galaxy - Non-overlapping Grid */}
            <div className="absolute inset-0 z-20 pointer-events-none">
                {clubOffsets.map((off) => {
                    const club = clubs[off.clubIdx];
                    if (!club) return null;
                    const isActive = !hoveredLeague || club.seasonId === hoveredLeague.id;
                    const leagueColor = TOP_LEAGUES.find(l => l.id === club.seasonId)?.color || "rgba(255,255,255,0.2)";
                    
                    return (
                        <ClubDot 
                          key={club.id}
                          club={club}
                          off={off}
                          isActive={isActive}
                          leagueColor={leagueColor}
                          hoveredLeague={!!hoveredLeague}
                        />
                    );
                })}
            </div>

        </div>
      </div>

      {/* Overlays */}
      <div className="absolute bottom-12 left-12 z-30 pointer-events-none select-none">
        <h2 className="text-4xl font-black tracking-tighter text-foreground">LEAGUE<span className="text-secondary">GALAXY</span></h2>
        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.5em] font-bold">Navigating the Football Multiverse</p>
      </div>

      <div className="absolute top-12 right-12 z-30 text-right pointer-events-none select-none">
        <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-black mb-1">Active Sector</p>
        <h3 className="text-xl font-bold text-foreground">{hoveredLeague?.name || "All European Sectors"}</h3>
        <p className="text-[9px] text-secondary uppercase font-black tracking-widest mt-1">{hoveredLeague?.country || "Synchronizing..."}</p>
      </div>

    </div>
  );
}

const ClubDot = memo(({ club, off, isActive, leagueColor, hoveredLeague }: any) => {
  return (
    <motion.div 
        className="absolute"
        style={{ 
            left: off.x, 
            top: off.y,
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
            x: hoveredLeague ? 0 : [0, off.driftX, 0],
            y: hoveredLeague ? 0 : [0, off.driftY, 0],
            opacity: isActive ? (hoveredLeague ? 1 : off.opacity) : 0.1,
            scale: isActive ? (hoveredLeague ? 1.2 : off.scale) : 0.4
        }}
        transition={{ 
            x: { duration: off.speed, repeat: Infinity, ease: "easeInOut" },
            y: { duration: off.speed * 1.2, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 0.5 },
            scale: { duration: 0.5 }
        }}
    >
        <motion.div
            whileHover={{ scale: 1.5, zIndex: 100 }}
            className="relative group cursor-pointer pointer-events-auto"
        >
            <div className="w-12 h-12 rounded-full border-2 p-1 flex items-center justify-center bg-card/60 backdrop-blur-sm transition-all duration-500 relative"
                    style={{ 
                    borderColor: isActive ? leagueColor : "rgba(255,255,255,0.05)",
                    boxShadow: isActive && hoveredLeague ? `0 0 20px ${leagueColor}` : 'none'
                    }}>
                <div className="relative w-10 h-10">
                    <Image 
                        src={club.logo} 
                        alt={club.name} 
                        fill
                        sizes="40px"
                        className={`object-contain transition-all duration-500 ${isActive ? 'grayscale-0' : 'grayscale brightness-50'}`} 
                    />
                </div>
            </div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-card text-[8px] px-2 py-1 rounded text-foreground whitespace-nowrap transition-opacity border border-border">
                {club.name}
            </div>
        </motion.div>
    </motion.div>
  );
});

ClubDot.displayName = 'ClubDot';
