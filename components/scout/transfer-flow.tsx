"use client";

import React, { useEffect, useState, useMemo, useCallback, Fragment } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  MapPin, 
  ArrowRightLeft, 
  TrendingUp, 
  Trash2, 
  Plus, 
  Search, 
  AlertCircle,
  X,
  Eye,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { getTopLeaguesClubsAction, getPlayersByClubAction, getTransfersAction, getPlayerPhotosAction } from "@/app/actions/statorium";
import { geocodeCity, getCachedGeocode } from "@/lib/utils/geocoding";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger 
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import "leaflet/dist/leaflet.css";

// Dynamic imports for Leaflet
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then((mod) => mod.Polyline), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const L = typeof window !== 'undefined' ? require('leaflet') : null;

import { TransferDetailsModal } from "./transfer-details-modal";

export interface Transfer {
  id: string;
  playerName: string;
  playerID: string;
  fromTeamID: string;
  fromTeamName: string;
  toTeamID: string;
  toTeamName: string;
  fee: string;
  color: string;
  valuation?: string;
  justification?: string;
  marketValue?: string;
  photoUrl?: string;
}

interface Club {
  id: string;
  name: string;
  city: string;
  pos?: [number, number];
  logo?: string;
  seasonId?: string;
}

interface Player {
  id: string;
  name: string;
  marketValue: string;
  photoUrl?: string;
}

// Bezier Curve Logic
export const getBezierPoints = (start: [number, number], end: [number, number]) => {
  const midX = (start[0] + end[0]) / 2;
  const midY = (start[1] + end[1]) / 2;
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const normalX = -dy;
  const normalY = dx;
  const chordLength = Math.sqrt(dx * dx + dy * dy);
  const curvature = 0.2; 
  
  const cp = [
    midX + (normalX / (chordLength || 1)) * curvature * chordLength,
    midY + (normalY / (chordLength || 1)) * curvature * chordLength
  ] as [number, number];

  // 1. Fine-grained sampling for arc-length calculation
  const rawPoints: [number, number][] = [];
  const precision = 100;
  for (let i = 0; i <= precision; i++) {
    const t = i / precision;
    const x = (1 - t) * (1 - t) * start[0] + 2 * (1 - t) * t * cp[0] + t * t * end[0];
    const y = (1 - t) * (1 - t) * start[1] + 2 * (1 - t) * t * cp[1] + t * t * end[1];
    rawPoints.push([x, y]);
  }

  // 2. Calculate cumulative distances along the curve
  const distances: number[] = [0];
  let totalLength = 0;
  for (let i = 1; i < rawPoints.length; i++) {
    const segmentDist = Math.sqrt(
      Math.pow(rawPoints[i][0] - rawPoints[i-1][0], 2) + 
      Math.pow(rawPoints[i][1] - rawPoints[i-1][1], 2)
    );
    totalLength += segmentDist;
    distances.push(totalLength);
  }

  // 3. Resample equidistant points to ensure constant velocity
  const points: [number, number][] = [];
  const numSegments = Math.max(30, Math.floor(totalLength * 8)); 
  
  for (let i = 0; i <= numSegments; i++) {
    const targetDist = (i / numSegments) * totalLength;
    let idx = 0;
    while (idx < distances.length - 1 && distances[idx+1] < targetDist) {
      idx++;
    }
    
    const d1 = distances[idx];
    const d2 = distances[idx+1];
    const ratio = (targetDist - d1) / (d2 - d1 || 0.001);
    
    points.push([
      rawPoints[idx][0] + (rawPoints[idx+1][0] - rawPoints[idx][0]) * ratio,
      rawPoints[idx][1] + (rawPoints[idx+1][1] - rawPoints[idx][1]) * ratio
    ]);
  }

  return points;
};

// Animated Logo Component
export const MovingDot = ({ points, color, logoUrl, centerMap }: { points: [number, number][], color: string, logoUrl?: string, centerMap?: boolean }) => {
  const [index, setIndex] = useState(0);
  const [useMapHook, setUseMapHook] = useState<any>(null);

  useEffect(() => {
    if (centerMap) {
      import('react-leaflet').then(mod => setUseMapHook(() => mod.useMap)).catch(console.error);
    }
  }, [centerMap]);

  useEffect(() => {
    if (points.length === 0) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % points.length);
    }, 40);
    return () => clearInterval(interval);
  }, [points]);

  if (points.length === 0 || typeof window === 'undefined' || !L) return null;
  
  const icon = L.icon({
    iconUrl: logoUrl || '/globe.svg',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    className: 'rounded-full border border-white/20 shadow-lg bg-black/40 backdrop-blur-sm'
  });

  return (
    <>
      <Marker position={points[index]} icon={icon} />
      {centerMap && useMapHook && <MapPanInner center={points[index]} useMap={useMapHook} />}
    </>
  );
};

const MapPanInner = ({ center, useMap }: { center: [number, number], useMap: any }) => {
  const map = useMap();
  useEffect(() => {
    if (map) map.panTo(center, { animate: false });
  }, [center, map]);
  return null;
};

export function TransferFlow({ teamId = "1" }: { teamId?: string }) {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [allClubs, setAllClubs] = useState<Club[]>([]);
  const [loadingClubs, setLoadingClubs] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ field: 'playerName' | 'fee' | null, direction: 'asc' | 'desc' | null }>({ field: null, direction: null });
  
  const trackTransfer = async (transfer: Transfer) => {
    if (transfers.find(t => t.id === transfer.id)) return;
    
    const resolve = async (name: string) => {
      const cached = getCachedGeocode(name);
      if (cached) return [cached.lat, cached.lng] as [number, number];
      
      const cleanName = name
        .replace(/\d+\.\s*/g, '')
        .replace(/^FC\s+/i, '')
        .replace(/\s+FC$/i, '')
        .replace(/^SC\s+/i, '')
        .replace(/^SV\s+/i, '')
        .replace(/^AC\s+/i, '')
        .replace(/^AS\s+/i, '')
        .replace(/^RC\s+/i, '')
        .trim();

      const fallbacks = [
        name,
        cleanName,
        cleanName.split(' ')[0],
        cleanName.replace(/Ă¶/g, 'o').replace(/ĂĽ/g, 'u').replace(/Ă¤/g, 'a'),
        cleanName === 'Koln' ? 'Cologne' : cleanName,
        cleanName === 'Sevilla' ? 'Seville' : cleanName
      ];

      for (const query of fallbacks) {
        if (!query) continue;
        const res = await geocodeCity(query);
        if (res) return [res.lat, res.lng] as [number, number];
      }
      
      return null;
    };

    const [startPos, endPos] = await Promise.all([
      resolve(transfer.fromTeamName),
      resolve(transfer.toTeamName)
    ]);

    if (startPos || endPos) {
      setAllClubs(prev => {
        const next = [...prev];
        if (startPos && !next.find(c => c.id === transfer.fromTeamID)) {
          next.push({ id: transfer.fromTeamID, name: transfer.fromTeamName, city: '', pos: startPos });
        }
        if (endPos && !next.find(c => c.id === transfer.toTeamID)) {
          next.push({ id: transfer.toTeamID, name: transfer.toTeamName, city: '', pos: endPos });
        }
        return next;
      });
    }

    await new Promise(r => setTimeout(r, 100));
    setTransfers(prev => [transfer, ...prev]);
  };
  
  const [evaluating, setEvaluating] = useState<Record<string, boolean>>({});
  const [searchingPlayer, setSearchingPlayer] = useState("");
  const [globalTransfers, setGlobalTransfers] = useState<Transfer[]>([]);
  const [focusedTransfer, setFocusedTransfer] = useState<Transfer | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<string>("");
  const [selectedClubId, setSelectedClubId] = useState<string>("");
  const [searchingClub, setSearchingClub] = useState("");
  const [loadingPlayersInModal, setLoadingPlayersInModal] = useState(false);
  const [modalPlayers, setModalPlayers] = useState<Player[]>([]);
  const [selectedPlayerForLink, setSelectedPlayerForLink] = useState<any>(null);

  const TOP_LEAGUES_DATA = [
    { id: "515", name: "Premier League" },
    { id: "558", name: "La Liga" },
    { id: "511", name: "Serie A" },
    { id: "521", name: "Bundesliga" },
    { id: "519", name: "Ligue 1" },
  ];

  const FALLBACK_PHOTO = "/globe.svg"; 

  useEffect(() => {
    async function quickInit() {
      setLoadingClubs(true);
      try {
        const clubs = await getTopLeaguesClubsAction();
        setAllClubs(clubs);
        
        const VERIFIED_TRANSFERS: Transfer[] = [
          { id: "v1", playerName: "Kylian Mbappé", playerID: "1994", fromTeamID: "66", fromTeamName: "PSG", toTeamID: "37", toTeamName: "Real Madrid", fee: "Free", color: "#facc15", marketValue: "€180M", photoUrl: "https://api.statorium.com/media/bearleague/bl1994.webp" },
          { id: "v2", playerName: "Julián Álvarez", playerID: "19323", fromTeamID: "4", fromTeamName: "Manchester City", toTeamID: "39", toTeamName: "Atlético Madrid", fee: "€75M", color: "#ef4444", marketValue: "€90M", photoUrl: "https://api.statorium.com/media/bearleague/bl19323.webp" },
          { id: "v3", playerName: "Dominic Solanke", playerID: "443", fromTeamID: "16", fromTeamName: "Bournemouth", toTeamID: "2", toTeamName: "Tottenham", fee: "€75M", color: "#ffffff", marketValue: "€50M", photoUrl: "https://api.statorium.com/media/bearleague/bl443.webp" },
          { id: "v4", playerName: "Michael Olise", playerID: "6123", fromTeamID: "15", fromTeamName: "Crystal Palace", toTeamID: "47", toTeamName: "Bayern Munich", fee: "€53M", color: "#dc2626", marketValue: "€55M", photoUrl: "https://api.statorium.com/media/bearleague/bl6123.webp" },
          { id: "v5", playerName: "Douglas Luiz", playerID: "762", fromTeamID: "112", fromTeamName: "Aston Villa", toTeamID: "105", toTeamName: "Juventus", fee: "€50M", color: "#ffffff", marketValue: "€70M", photoUrl: "https://api.statorium.com/media/bearleague/bl762.webp" },
          { id: "v6", playerName: "Leny Yoro", playerID: "123145", fromTeamID: "69", fromTeamName: "Lille", toTeamID: "7", toTeamName: "Manchester United", fee: "€62M", color: "#dc2626", marketValue: "€50M", photoUrl: "https://api.statorium.com/media/bearleague/bl123145.webp" },
          { id: "v7", playerName: "Dani Olmo", playerID: "1815", fromTeamID: "166", fromTeamName: "RB Leipzig", toTeamID: "23", toTeamName: "Barcelona", fee: "€55M", color: "#9333ea", marketValue: "€60M", photoUrl: "https://api.statorium.com/media/bearleague/bl1815.webp" },
          { id: "v8", playerName: "João Neves", playerID: "25014", fromTeamID: "192", fromTeamName: "Benfica", toTeamID: "66", toTeamName: "PSG", fee: "€60M", color: "#1d4ed8", marketValue: "€55M", photoUrl: "https://api.statorium.com/media/bearleague/bl25014.webp" },
          { id: "v9", playerName: "Teun Koopmeiners", playerID: "4145", fromTeamID: "41", fromTeamName: "Atalanta", toTeamID: "105", toTeamName: "Juventus", fee: "€52M", color: "#ffffff", marketValue: "€50M", photoUrl: "https://api.statorium.com/media/bearleague/bl4145.webp" },
          { id: "v10", playerName: "Amadou Onana", playerID: "26718", fromTeamID: "6", fromTeamName: "Everton", toTeamID: "112", toTeamName: "Aston Villa", fee: "€59M", color: "#8b5cf6", marketValue: "€50M", photoUrl: "https://api.statorium.com/media/bearleague/bl26718.webp" },
          { id: "v11", playerName: "Alvaro Morata", playerID: "55", fromTeamID: "39", fromTeamName: "Atletico Madrid", toTeamID: "96", toTeamName: "AC Milan", fee: "€13M", color: "#dc2626", marketValue: "€15M", photoUrl: "https://api.statorium.com/media/bearleague/bl55.webp" },
          { id: "v12", playerName: "Connor Gallagher", playerID: "12514", fromTeamID: "8", fromTeamName: "Chelsea", toTeamID: "39", toTeamName: "Atletico Madrid", fee: "€42M", color: "#ef4444", marketValue: "€50M", photoUrl: "https://api.statorium.com/media/bearleague/bl12514.webp" },
          { id: "v13", playerName: "Ilkay Gündogan", playerID: "92", fromTeamID: "23", fromTeamName: "Barcelona", toTeamID: "4", toTeamName: "Manchester City", fee: "Free", color: "#60a5fa", marketValue: "€15M", photoUrl: "https://api.statorium.com/media/bearleague/bl92.webp" },
          { id: "v14", playerName: "Savinho", playerID: "16498", fromTeamID: "26", fromTeamName: "Girona", toTeamID: "4", toTeamName: "Manchester City", fee: "€25M", color: "#60a5fa", marketValue: "€50M", photoUrl: "https://api.statorium.com/media/bearleague/bl16498.webp" },
          { id: "v15", playerName: "Riccardo Calafiori", playerID: "31452", fromTeamID: "93", fromTeamName: "Bologna", toTeamID: "9", toTeamName: "Arsenal", fee: "€45M", color: "#ef4444", marketValue: "€45M", photoUrl: "https://api.statorium.com/media/bearleague/bl31452.webp" },
          { id: "v16", playerName: "Federico Chiesa", playerID: "2345", fromTeamID: "105", fromTeamName: "Juventus", toTeamID: "3", toTeamName: "Liverpool", fee: "€12M", color: "#dc2626", marketValue: "€30M", photoUrl: "https://api.statorium.com/media/bearleague/bl2345.webp" }
        ];
        
        setGlobalTransfers(VERIFIED_TRANSFERS);

        (async () => {
          const photoMap = await getPlayerPhotosAction(
            VERIFIED_TRANSFERS.map(t => ({ playerID: t.playerID, playerName: t.playerName }))
          );
          setGlobalTransfers(prev =>
            prev.map(t => ({
              ...t,
              photoUrl: photoMap[t.playerID] || t.photoUrl || ""
            }))
          );
        })();

        const saved = localStorage.getItem(`scout_transfers_${teamId}`);
        if (saved) setTransfers(JSON.parse(saved).map((t:any) => ({...t, photoUrl: t.photoUrl || FALLBACK_PHOTO})));
        else setTransfers(VERIFIED_TRANSFERS.slice(0, 5));
      } catch (err) {
        setError("Market Sync Error: Data integrity compromised by network latency.");
      } finally {
        setLoadingClubs(false);
      }
    }
    quickInit();
  }, [teamId]);

  useEffect(() => {
    if (!selectedClubId) {
      setModalPlayers([]);
      return;
    }
    async function loadPlayers() {
      setLoadingPlayersInModal(true);
      try {
        const club = allClubs.find(c => c.id === selectedClubId);
        const players = await getPlayersByClubAction(selectedClubId, club?.seasonId);
        setModalPlayers(players);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingPlayersInModal(false);
      }
    }
    loadPlayers();
  }, [selectedClubId, allClubs]);

  useEffect(() => {
    if (!loadingClubs) {
      localStorage.setItem(`scout_transfers_${teamId}`, JSON.stringify(transfers));
    }
  }, [transfers, loadingClubs, teamId]);

  useEffect(() => {
    const missingNames = [...new Set(transfers.flatMap(t => {
      const startMissing = !allClubs.find(c => c.id === t.fromTeamID)?.pos;
      const endMissing = !allClubs.find(c => c.id === t.toTeamID)?.pos;
      
      const missing = [];
      if (startMissing) missing.push(t.fromTeamName);
      if (endMissing) missing.push(t.toTeamName);
      return missing;
    }))];

    if (missingNames.length > 0) {
      setTimeout(async () => {
        const results = await Promise.all(missingNames.map(async name => {
           const cached = getCachedGeocode(name);
           if (cached) return { name, pos: [cached.lat, cached.lng] as [number, number] };
           let res = await geocodeCity(name);
           if (!res) res = await geocodeCity(name.split(' ')[0]); 
           return { name, pos: res ? [res.lat, res.lng] as [number, number] : undefined };
        }));
        
        setAllClubs(prev => {
          let updated = false;
          const next = [...prev];
          
          results.forEach(r => {
             if (!r.pos) return;
             const tMatch = transfers.find(t => t.fromTeamName === r.name || t.toTeamName === r.name);
             const targetId = tMatch ? (tMatch.fromTeamName === r.name ? tMatch.fromTeamID : tMatch.toTeamID) : null;
             
             const existingIdx = next.findIndex(c => 
               c.name === r.name || 
               c.name.includes(r.name) || 
               r.name.includes(c.name) ||
               (targetId && c.id.toString() === targetId.toString())
             );
             
             if (existingIdx !== -1) {
               if (!next[existingIdx].pos) {
                 next[existingIdx] = { ...next[existingIdx], pos: r.pos };
                 updated = true;
               }
             } else if (targetId) {
               next.push({ id: targetId.toString(), name: r.name, city: '', pos: r.pos });
               updated = true;
             }
          });
          return updated ? next : prev;
        });
      }, 500);
    }
  }, [transfers, allClubs]);

  const handleDeleteTransfer = (id: string) => {
    setTransfers(prev => prev.filter(t => t.id !== id));
  };

  const evaluateTransfer = async (transfer: Transfer) => {
    if (evaluating[transfer.id]) return;

    setEvaluating(prev => ({ ...prev, [transfer.id]: true }));
    try {
      await new Promise(r => setTimeout(r, 1200)); 
      
      const feeNumeric = parseFloat(transfer.fee.replace(/[^0-9.]/g, '')) || 0;
      const mvNumeric = parseFloat(transfer.marketValue?.replace(/[^0-9.]/g, '') || String(feeNumeric));
      
      let valuation = "";
      let justification = "";
      
      if (mvNumeric === 0) {
        valuation = "Fair";
        justification = "Insufficient market data to conduct a high confidence AI evaluation.";
      } else {
        const diffPercent = (feeNumeric - mvNumeric) / mvNumeric;
        
        if (Math.abs(diffPercent) <= 0.1) {
          valuation = "Fair";
          justification = `The fee of ${transfer.fee} is within the 10% acceptable variance of the true market value (${transfer.marketValue}). Solid business.`;
        } else if (diffPercent > 0.1) {
          valuation = "Overpayment";
          justification = `At ${transfer.fee}, you are overpaying by roughly ${(diffPercent*100).toFixed(0)}%. The AI estimates actual market value at ${transfer.marketValue}.`;
        } else {
          valuation = "Bargain";
          justification = `Excellent deal! The fee of ${transfer.fee} provides a ${(Math.abs(diffPercent)*100).toFixed(0)}% strategic discount on the player's true market value of ${transfer.marketValue}.`;
        }
      }

      setTransfers(prev => prev.map(t => 
        t.id === transfer.id ? { ...t, valuation, justification } : t
      ));
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(prev => ({ ...prev, [transfer.id]: false }));
    }
  };

  const MapFlows = useMemo(() => {
    return transfers.map((t) => {
      const start = allClubs.find(c => c.id === t.fromTeamID || c.name === t.fromTeamName)?.pos;
      const end = allClubs.find(c => c.id === t.toTeamID || c.name === t.toTeamName)?.pos;
      if (!start || !end) return null;

      const points = getBezierPoints(start, end);
      const toClubLogo = allClubs.find(c => c.id.toString() === t.toTeamID.toString())?.logo || `https://api.statorium.com/media/bearleague/bl${t.toTeamID}.png`;

      return (
        <Fragment key={t.id}>
          <Polyline 
            positions={points} 
            pathOptions={{ 
              color: t.color, 
              weight: 2, 
              opacity: 0.6,
              dashArray: '5, 10',
            }} 
          />
          <MovingDot points={points} color={t.color} logoUrl={toClubLogo} />
        </Fragment>
      );
    });
  }, [transfers, allClubs]);

  const sortedTransfers = useMemo(() => {
    let result = [...transfers];
    if (!sortConfig.field) return result;

    result.sort((a, b) => {
      let valA: any = a[sortConfig.field!];
      let valB: any = b[sortConfig.field!];

      if (sortConfig.field === 'fee') {
        valA = parseFloat(a.fee.replace(/[^0-9.]/g, '')) || 0;
        valB = parseFloat(b.fee.replace(/[^0-9.]/g, '')) || 0;
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [transfers, sortConfig]);

  const toggleSort = (field: 'playerName' | 'fee') => {
    setSortConfig(prev => {
      if (prev.field === field) {
        if (prev.direction === 'asc') return { field, direction: 'desc' };
        return { field: null, direction: null };
      }
      return { field, direction: 'asc' };
    });
  };

  if (loadingClubs) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 animate-pulse" />
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-6 relative z-10" />
        <div className="flex flex-col items-center relative z-10 gap-2 text-center px-6">
          <span className="text-white/80 uppercase tracking-[0.3em] text-sm font-black italic">Initializing High-Speed Sync...</span>
          <p className="text-white/30 text-[10px] uppercase font-bold tracking-widest max-w-xs">Connecting to Statorium global nodes and pre-fetching market snapshots.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <ArrowRightLeft className="w-8 h-8 text-primary" />
            Transfer Flow Map
          </h2>
          <p className="text-white/40 text-sm mt-1 uppercase tracking-widest font-bold">Real-time global player movement visualization</p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/80 text-primary-foreground font-bold rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.3)] group h-12 px-6">
              <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform" />
              Add Custom Flow
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[425px] overflow-visible">
            <DialogHeader>
              <DialogTitle className="text-xl font-black italic tracking-tighter">REGISTER NEW TRANSFER</DialogTitle>
              <DialogDescription className="sr-only">
                Enter details to track a new player movement across the global market.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">1. Select League</label>
                <div className="grid grid-cols-2 gap-2">
                  {TOP_LEAGUES_DATA.map(l => (
                    <Button 
                      key={l.id}
                      variant="outline" 
                      onClick={() => { setSelectedLeague(l.id); setSelectedClubId(""); }}
                      className={cn(
                        "h-10 text-[10px] font-bold uppercase tracking-widest border-white/10 transition-all",
                        selectedLeague === l.id ? "bg-primary text-primary-foreground border-primary" : "bg-white/5 hover:bg-white/10"
                      )}
                    >
                      {l.name}
                    </Button>
                  ))}
                </div>
              </div>

              {selectedLeague && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">2. Select Club</label>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30" />
                    <input 
                      type="text" 
                      placeholder="Filter clubs..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg h-9 pl-8 pr-3 text-[11px] text-white focus:outline-none focus:border-primary"
                      onChange={(e) => setSearchingClub(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto custom-scrollbar pr-2">
                    {allClubs
                      .filter(c => c.seasonId === selectedLeague && (!searchingClub || c.name.toLowerCase().includes(searchingClub.toLowerCase())))
                      .map(c => (
                        <Button 
                          key={c.id}
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedClubId(c.id)}
                          className={cn(
                            "h-9 text-[9px] font-bold border-white/10 justify-start px-3",
                            selectedClubId === c.id ? "bg-white/20 border-white/40" : "bg-white/5 hover:bg-white/10"
                          )}
                        >
                          <span className="truncate">{c.name}</span>
                        </Button>
                      ))}
                  </div>
                </div>
              )}

              {selectedClubId && !selectedPlayerForLink && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2 block">3. Select Player</label>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30" />
                    <input 
                      type="text" 
                      placeholder="Filter players..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg h-9 pl-8 pr-3 text-[11px] text-white focus:outline-none focus:border-primary"
                      onChange={(e) => setSearchingPlayer(e.target.value)}
                    />
                  </div>
                  <div className="max-h-[200px] overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                    {loadingPlayersInModal ? (
                      <div className="py-8 flex flex-col items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-[9px] font-black text-white/20 tracking-widest uppercase">Fetching Roster...</span>
                      </div>
                    ) : (
                      modalPlayers
                        .filter(p => !searchingPlayer || p.name.toLowerCase().includes(searchingPlayer.toLowerCase()))
                        .map(p => (
                          <Button 
                            key={p.id}
                            variant="ghost"
                            className="w-full justify-start h-12 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/40 transition-all rounded-lg group px-3"
                            onClick={() => {
                              const fromClub = allClubs.find(c => c.id === selectedClubId);
                              setSelectedPlayerForLink({
                                playerName: p.name,
                                playerID: p.id,
                                fromTeamID: selectedClubId,
                                fromTeamName: fromClub?.name || "",
                                marketValue: p.marketValue,
                                photoUrl: p.photoUrl || FALLBACK_PHOTO
                              });
                            }}
                          >
                            <div className="flex items-center gap-3 w-full">
                               <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center overflow-hidden border border-white/10">
                                  <img 
                                    src={p.photoUrl || FALLBACK_PHOTO} 
                                    className="w-full h-full object-cover" 
                                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_PHOTO; }}
                                  />
                               </div>
                               <div className="text-left flex-1">
                                  <p className="text-xs font-bold">{p.name}</p>
                                  <p className="text-[9px] text-white/30 uppercase tracking-tighter">{p.marketValue}</p>
                                </div>
                               <Plus className="w-3 h-3 text-white/10 group-hover:text-primary transition-colors" />
                            </div>
                          </Button>
                        ))
                    )}
                  </div>
                </div>
              )}

              {selectedPlayerForLink && (
                 <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between mb-4">
                       <label className="text-[10px] font-black uppercase tracking-widest text-primary block">4. Select Destination Club</label>
                       <Button variant="ghost" size="sm" onClick={() => setSelectedPlayerForLink(null)} className="h-6 text-[8px] uppercase font-bold text-white/40">Back</Button>
                    </div>
                    <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl mb-4 flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
                          <img src={selectedPlayerForLink.photoUrl} className="w-full h-full object-cover" />
                       </div>
                       <div>
                          <p className="text-xs font-bold">{selectedPlayerForLink.playerName}</p>
                          <p className="text-[9px] text-white/60 uppercase">Moving from {selectedPlayerForLink.fromTeamName}</p>
                       </div>
                    </div>
                    <div className="relative mb-2">
                       <input 
                         type="text" 
                         placeholder="Search destination club..."
                         className="w-full bg-white/5 border border-white/10 rounded-lg h-9 px-3 text-[11px] text-white focus:outline-none focus:border-primary"
                         onChange={(e) => setSearchingClub(e.target.value)}
                       />
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-2">
                       {allClubs
                         .filter(c => c.id !== selectedPlayerForLink.fromTeamID && (!searchingClub || c.name.toLowerCase().includes(searchingClub.toLowerCase())))
                         .map(c => (
                           <Button 
                             key={c.id} 
                             variant="outline"
                             size="sm"
                             onClick={() => {
                               trackTransfer({
                                 id: Math.random().toString(36).substr(2, 9),
                                 ...selectedPlayerForLink,
                                 toTeamID: c.id,
                                 toTeamName: c.name,
                                 fee: selectedPlayerForLink.marketValue,
                                 color: ["#3b82f6", "#ef4444", "#22c55e", "#facc15"][Math.floor(Math.random()*4)],
                               });
                               setIsModalOpen(false);
                               setSelectedPlayerForLink(null);
                               setSelectedLeague("");
                               setSelectedClubId("");
                             }}
                             className="h-9 text-[9px] font-bold border-white/10 bg-white/5 hover:bg-primary/20 hover:border-primary/40 text-left justify-start"
                           >
                              <span className="truncate">{c.name}</span>
                           </Button>
                         ))}
                    </div>
                 </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <Card className="overflow-hidden border-white/10 bg-black/40 backdrop-blur-xl relative">
            <CardContent className="p-0 relative h-[550px]">
              <MapContainer 
                center={[48.8566, 2.3522]} 
                zoom={4} 
                minZoom={2.5}
                maxBounds={[[-90, -180], [90, 180]]}
                maxBoundsViscosity={1.0}
                className="h-full w-full"
                style={{ background: '#09090b' }}
              >
                <TileLayer
                  attribution='&copy; CARTO'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  noWrap={true}
                  bounds={[[-90, -180], [90, 180]]}
                />
                {MapFlows}
              </MapContainer>
              <div className="absolute inset-0 pointer-events-none border-t border-white/5 bg-gradient-to-b from-transparent via-transparent to-black/40" />
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
            <CardHeader className="bg-white/5 border-b border-white/10 flex flex-row items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Transfer Intelligence Log
              </CardTitle>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-500 uppercase text-[10px] tracking-widest">
                LIVE ANALYTICS
              </Badge>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left font-sans text-white">
                <thead className="bg-white/5 border-b border-white/10 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
                  <tr>
                    <th 
                      className="px-6 py-5 cursor-pointer hover:text-white transition-colors group"
                      onClick={() => toggleSort('playerName')}
                    >
                      <div className="flex items-center gap-1">
                        Player
                        {sortConfig.field === 'playerName' && (
                           sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-5">Flow</th>
                    <th 
                      className="px-6 py-5 cursor-pointer hover:text-white transition-colors group"
                      onClick={() => toggleSort('fee')}
                    >
                      <div className="flex items-center gap-1">
                        Fee
                        {sortConfig.field === 'fee' && (
                           sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-primary" /> : <ChevronDown className="w-3 h-3 text-primary" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-5">AI Valuation</th>
                    <th className="px-6 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sortedTransfers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-white/20 italic text-sm">
                        No active transfer flows detected. Click "Add Custom Flow" to track a movement.
                      </td>
                    </tr>
                  ) : (
                    sortedTransfers.map((t) => (
                      <tr key={t.id} className="hover:bg-white/2 transition-colors group border-l-2 border-transparent hover:border-white/20">
                        <td className="px-6 py-4">
                          <div className="font-bold text-white text-base">{t.playerName}</div>
                          <div className="text-[10px] text-white/30 uppercase tracking-widest font-mono mt-1">ID: {t.playerID}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 text-sm font-bold">
                            <span style={{ color: t.color }}>{t.fromTeamName}</span>
                            <ArrowRightLeft className="w-4 h-4" style={{ color: t.color }} />
                            <span style={{ color: t.color }}>{t.toTeamName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm text-primary font-bold">
                          {t.fee}
                        </td>
                        <td className="px-6 py-4">
                          {t.valuation ? (
                            <div className="flex flex-col gap-1">
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "w-fit text-[10px] font-black px-2 pb-0.5",
                                  t.valuation === 'Bargain' ? 'border-green-500 text-green-400 bg-green-500/10' :
                                  t.valuation === 'Overpayment' ? 'border-red-500 text-red-400 bg-red-500/10' :
                                  'border-blue-500 text-blue-400 bg-blue-500/10'
                                )}
                              >
                                {t.valuation.toUpperCase()}
                              </Badge>
                              <p className="text-[10px] text-white/40 max-w-[200px] leading-tight mt-1">
                                {t.justification}
                              </p>
                            </div>
                          ) : (
                            <span className="text-[10px] text-white/10 uppercase font-black tracking-widest">Awaiting Analysis...</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {!t.valuation && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-9 px-3 gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 text-white/60 hover:text-primary transition-all"
                                disabled={evaluating[t.id]}
                                onClick={() => evaluateTransfer(t)}
                              >
                                {evaluating[t.id] ? <Loader2 className="w-3 h-3 animate-spin"/> : <TrendingUp className="w-3 h-3" />}
                                Scout AI
                              </Button>
                            )}
                            <Button 
                              onClick={() => handleDeleteTransfer(t.id)}
                              size="sm" 
                              variant="ghost" 
                              className="h-9 w-9 p-0 text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-all rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-4 space-y-6 flex flex-col">
          <Card className="border-white/10 bg-black/40 backdrop-blur-xl h-[550px] flex flex-col border-t-2 border-t-primary/50 shadow-2xl">
            <CardHeader className="bg-white/5 border-b border-white/10 py-5 flex-shrink-0">
              <CardTitle className="text-lg font-black uppercase text-white flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                Global Market
              </CardTitle>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">LATEST LIVE TRANSFERS (TOP 15)</p>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto flex-1 divide-y divide-white/5 custom-scrollbar">
              {globalTransfers.length === 0 ? (
                 <div className="p-6 text-center text-sm text-white/30 italic">Awaiting global market data...</div>
              ) : (
                 globalTransfers.map((t) => (
                   <div key={t.id} onClick={() => setFocusedTransfer(t)} className="p-4 hover:bg-white/5 transition-colors group cursor-pointer">
                     <div className="flex gap-4 items-center">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 relative overflow-hidden group-hover:scale-110 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)] p-1.5">
                           {(() => {
                              const logo = allClubs.find(c => c.id.toString() === t.toTeamID.toString())?.logo;
                              return logo ? (
                                <img
                                  src={logo}
                                  alt={t.toTeamName}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                  }}
                                />
                              ) : (
                                <ArrowRightLeft className="w-4 h-4 text-white/20" />
                              );
                           })()}
                        </div>
                       <div className="flex-1 min-w-0">
                         <h4 className="text-white font-bold text-xs truncate mb-0.5 group-hover:text-primary transition-colors">{t.playerName}</h4>
                         <div className="flex items-center gap-1.5 mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
                           <span className="text-[9px] uppercase font-bold tracking-widest text-white/40 max-w-[80px] truncate" title={t.fromTeamName}>{t.fromTeamName}</span>
                           <ArrowRightLeft className="w-2 h-2 text-white/20 flex-shrink-0" />
                           <span className="text-[9px] uppercase font-black tracking-widest text-primary/80 flex-1 max-w-[80px] truncate" title={t.toTeamName}>{t.toTeamName}</span>
                         </div>
                       </div>
                       <div className="flex flex-col items-center gap-2">
                         <div className="text-right flex-shrink-0 pl-2">
                           <div className="text-xs font-black text-white">
                             {t.fee === "Free" ? "Free" : t.fee.replace('€', '') + (t.fee.endsWith('M') ? '' : 'M')}
                           </div>
                           <div className="text-[8px] text-white/30 uppercase mt-0.5 font-bold tracking-widest">FEE</div>
                         </div>
                         <Button 
                           size="sm" 
                           variant="ghost" 
                           className="h-8 w-8 p-0 rounded-full hover:bg-primary/20 hover:text-primary transition-all border border-white/10"
                           onClick={(e) => {
                             e.stopPropagation();
                             trackTransfer(t);
                           }}
                         >
                           <Eye className="w-3.5 h-3.5" />
                         </Button>
                       </div>
                     </div>
                   </div>
                 ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!focusedTransfer} onOpenChange={(v) => !v && setFocusedTransfer(null)}>
        <DialogContent className="bg-black/90 backdrop-blur-3xl border-white/10 text-white sm:max-w-[800px] p-0 overflow-hidden shadow-[0_0_60px_rgba(59,130,246,0.2)]">
           <DialogHeader className="sr-only">
             <DialogTitle>Transfer Intelligence: {focusedTransfer?.playerName}</DialogTitle>
             <DialogDescription>
               Detailed analytics and trajectory for {focusedTransfer?.playerName}'s move to {focusedTransfer?.toTeamName}
             </DialogDescription>
           </DialogHeader>
           {focusedTransfer && (
             <TransferDetailsModal 
                transfer={focusedTransfer} 
                allClubs={allClubs} 
                onEvaluate={() => {
                  evaluateTransfer(focusedTransfer);
                }}
                evaluating={evaluating[focusedTransfer.id]}
             />
           )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
