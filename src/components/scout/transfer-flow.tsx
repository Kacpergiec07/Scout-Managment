"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ArrowRightLeft,
  TrendingUp,
  Trash2,
  Plus,
  Search,
  ChevronDown,
  ChevronUp,
  Globe,
  UserCircle
} from "lucide-react";
import { getTopLeaguesClubsAction, getPlayersByClubAction, getPlayerPhotosAction } from "@/app/actions/statorium";
import { geocodeCity, getCachedGeocode } from "@/lib/utils/geocoding";
import { Globe3D, GlobeMarker, GlobeArc } from "@/components/ui/3d-globe";
import { GlobalMarketCard } from "./global-market-card";
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

// Dynamic imports
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

  const points: [number, number][] = [];
  const precision = 50;
  for (let i = 0; i <= precision; i++) {
    const t = i / precision;
    const x = (1 - t) * (1 - t) * start[0] + 2 * (1 - t) * t * cp[0] + t * t * end[0];
    const y = (1 - t) * (1 - t) * start[1] + 2 * (1 - t) * t * cp[1] + t * t * end[1];
    points.push([x, y]);
  }
  return points;
};

const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });

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
    className: 'rounded-full border border-border shadow-lg bg-card/40 backdrop-blur-sm'
  });

  return (
    <>
      <Marker position={points[index]} icon={icon} />
      {useMapHook && <MapPanInner center={points[index]} useMap={useMapHook} />}
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

  const trackTransfer = async (transfer: Transfer) => {
    if (transfers.find(t => t.id === transfer.id)) return;
    
    // Quick geocoding resolve
    const resolve = async (name: string) => {
      const cached = getCachedGeocode(name);
      if (cached) return [cached.lat, cached.lng] as [number, number];
      const res = await geocodeCity(name);
      return res ? [res.lat, res.lng] as [number, number] : null;
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

    setTransfers(prev => [transfer, ...prev]);
  };

  useEffect(() => {
    async function quickInit() {
      setLoadingClubs(true);
      try {
        const VERIFIED_TRANSFERS: Transfer[] = [
          { id: "v1", playerName: "Kylian Mbappé", playerID: "1994", fromTeamID: "66", fromTeamName: "PSG", toTeamID: "37", toTeamName: "Real Madrid", fee: "Free", color: "#facc15", marketValue: "€180M", photoUrl: "https://api.statorium.com/media/bearleague/bl1994.webp" },
          { id: "v2", playerName: "Julián Álvarez", playerID: "19323", fromTeamID: "4", fromTeamName: "Manchester City", toTeamID: "39", toTeamName: "Atlético Madrid", fee: "€75M", color: "#ef4444", marketValue: "€90M", photoUrl: "https://api.statorium.com/media/bearleague/bl19323.webp" },
          { id: "v15", playerName: "Riccardo Calafiori", playerID: "31452", fromTeamID: "93", fromTeamName: "Bologna", toTeamID: "9", toTeamName: "Arsenal", fee: "€45M", color: "#ef4444", marketValue: "€45M", photoUrl: "https://api.statorium.com/media/bearleague/bl31452.webp" },
          { id: "v16", playerName: "Federico Chiesa", playerID: "2345", fromTeamID: "105", fromTeamName: "Juventus", toTeamID: "3", toTeamName: "Liverpool", fee: "€12M", color: "#dc2626", marketValue: "€30M", photoUrl: "https://api.statorium.com/media/bearleague/bl2345.webp" }
        ];
        
        setGlobalTransfers(VERIFIED_TRANSFERS);
        setTransfers(VERIFIED_TRANSFERS.slice(0, 5));

        // Fetch photos
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

      } catch (err) {
        setError("Market Sync Error");
      } finally {
        setLoadingClubs(false);
      }
    }
    quickInit();
  }, [teamId]);

  useEffect(() => {
    if (!selectedClubId) return;
    async function loadPlayers() {
      setLoadingPlayersInModal(true);
      try {
        const players = await getPlayersByClubAction(selectedClubId);
        setModalPlayers(players);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingPlayersInModal(false);
      }
    }
    loadPlayers();
  }, [selectedClubId]);

  const evaluateTransfer = async (transfer: Transfer) => {
    setEvaluating(prev => ({ ...prev, [transfer.id]: true }));
    await new Promise(r => setTimeout(r, 1000));
    setTransfers(prev => prev.map(t => 
      t.id === transfer.id ? { ...t, valuation: "Fair", justification: "Market aligned." } : t
    ));
    setEvaluating(prev => ({ ...prev, [transfer.id]: false }));
  };

  const globeMarkers = useMemo(() => {
    return allClubs.filter(c => c.pos).map(c => ({
      lat: c.pos![0], lng: c.pos![1], label: c.name, color: "#3b82f6"
    }));
  }, [allClubs]);

  const globeArcs = useMemo(() => {
    return transfers.map((t, idx) => {
      const start = allClubs.find(c => c.id === t.fromTeamID)?.pos;
      const end = allClubs.find(c => c.id === t.toTeamID)?.pos;
      if (!start || !end) return null;
      return {
        order: idx, startLat: start[0], startLng: start[1], endLat: end[0], endLng: end[1], arcAlt: 0.2, color: t.color
      };
    }).filter(Boolean) as GlobeArc[];
  }, [transfers, allClubs]);

  const sortedTransfers = useMemo(() => {
    let result = [...transfers];
    if (!sortConfig.field) return result;
    result.sort((a, b) => {
       const valA = a[sortConfig.field!] || "";
       const valB = b[sortConfig.field!] || "";
       return sortConfig.direction === 'asc' ? (valA < valB ? -1 : 1) : (valA > valB ? -1 : 1);
    });
    return result;
  }, [transfers, sortConfig]);

  const toggleSort = (field: 'playerName' | 'fee') => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  if (loadingClubs) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-card/40 backdrop-blur-xl border border-border rounded-2xl">
        <Loader2 className="w-10 h-10 animate-spin text-secondary mb-4" />
        <span className="text-muted-foreground uppercase tracking-widest text-sm font-bold">Syncing Market Data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-foreground flex items-center gap-3">
            <ArrowRightLeft className="w-8 h-8 text-secondary" />
            Transfer Flow Map
          </h2>
          <p className="text-muted-foreground text-sm mt-1 uppercase tracking-widest font-bold font-mono">Real-time global player movement</p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-secondary hover:bg-secondary/80 font-bold h-12 px-6 rounded-xl">
              <Plus className="w-5 h-5 mr-2" />
              Add Custom Flow
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-black uppercase tracking-tighter">New Transfer</DialogTitle>
              <DialogDescription className="sr-only">Register a new player movement</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-[10px] font-black uppercase text-muted-foreground block mb-2">1. Select League</label>
                <div className="grid grid-cols-2 gap-2">
                  {TOP_LEAGUES_DATA.map(l => (
                    <Button 
                      key={l.id} 
                      variant="outline" 
                      size="sm" 
                      onClick={() => { setSelectedLeague(l.id); setSelectedClubId(""); }}
                      className={cn(selectedLeague === l.id && "bg-secondary border-secondary")}
                    >
                      {l.name}
                    </Button>
                  ))}
                </div>
              </div>
              
              {selectedLeague && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground block">2. Select Club</label>
                  <div className="grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto pr-1">
                    {/* Simplified for demo: only showing clubs if geocoded or from leagues */}
                    {allClubs.map(c => (
                      <Button key={c.id} variant="ghost" size="sm" onClick={() => setSelectedClubId(c.id)} className="justify-start truncate">
                        {c.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {selectedClubId && (
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-muted-foreground block">3. Select Player</label>
                   <div className="max-h-[150px] overflow-y-auto space-y-1">
                      {loadingPlayersInModal ? <Loader2 className="animate-spin mx-auto w-4 h-4" /> : 
                        modalPlayers.map(p => (
                          <Button key={p.id} variant="ghost" className="w-full justify-start text-xs" onClick={() => {
                            // Finish logic
                            setIsModalOpen(false);
                          }}>
                            {p.name}
                          </Button>
                        ))
                      }
                   </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="w-full">
        <div className="bg-card backdrop-blur-xl border border-border rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left font-sans text-foreground border-collapse">
               <thead className="bg-accent/50 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black border-b border-border">
                 <tr>
                   <th className="px-8 py-6 cursor-pointer hover:text-foreground transition-colors" onClick={() => toggleSort('playerName')}>
                     <div className="flex items-center gap-2">
                        Player Details
                        {sortConfig.field === 'playerName' && <ChevronDown className={cn("w-3 h-3 text-secondary", sortConfig.direction === 'asc' && "rotate-180")} />}
                     </div>
                   </th>
                   <th className="px-8 py-6 text-muted-foreground">Transfer Vector</th>
                   <th className="px-8 py-6 cursor-pointer hover:text-foreground transition-colors" onClick={() => toggleSort('fee')}>
                     <div className="flex items-center gap-2">
                        Financials
                        {sortConfig.field === 'fee' && <ChevronDown className={cn("w-3 h-3 text-secondary", sortConfig.direction === 'asc' && "rotate-180")} />}
                     </div>
                   </th>
                   <th className="px-8 py-6 text-muted-foreground">Intelligence / Valuation</th>
                   <th className="px-8 py-6 text-right text-muted-foreground">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-border">
                  {sortedTransfers.map(t => (
                    <tr key={t.id} className="hover:bg-accent/40 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-xl bg-accent border border-border overflow-hidden flex items-center justify-center p-2 relative">
                              {t.photoUrl ? (
                                <>
                                  <img
                                    src={t.photoUrl}
                                    alt={t.playerName}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      const placeholder = e.currentTarget.nextElementSibling;
                                      if (placeholder) (placeholder as HTMLElement).style.display = 'flex';
                                    }}
                                  />
                                  <div className="hidden absolute inset-0 flex items-center justify-center bg-background/80">
                                    <UserCircle className="w-6 h-6 text-muted-foreground/40" />
                                  </div>
                                </>
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                                  <UserCircle className="w-6 h-6 text-muted-foreground/40" />
                                </div>
                              )}
                           </div>
                           <div>
                             <div className="font-bold text-foreground group-hover:text-secondary transition-colors">{t.playerName}</div>
                             <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mt-0.5 font-mono">ID: {t.playerID}</div>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <span className="text-xs font-bold px-3 py-1 bg-accent border border-border rounded-full text-foreground/70">{t.fromTeamName}</span>
                           <div className="flex flex-col items-center gap-0">
                              <div className="h-px w-8 bg-border relative">
                                 <div className="absolute right-0 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-l-4 border-l-border" />
                              </div>
                           </div>
                           <span className="text-xs font-bold px-3 py-1 bg-secondary/10 border border-secondary/20 rounded-full text-secondary">{t.toTeamName}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-mono text-secondary font-black text-lg">{t.fee}</div>
                        <div className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest font-mono">EST. {t.marketValue || "Analyzing"}</div>
                      </td>
                      <td className="px-8 py-6">
                        {t.valuation ? (
                          <div className="space-y-1.5">
                            <Badge variant="outline" className={cn(
                              "text-[10px] font-black uppercase tracking-widest px-2 py-0.5",
                              t.valuation === "Fair" ? "border-secondary-500/50 text-secondary-600 dark:text-secondary-500 bg-secondary-500/5" : "border-secondary/50 text-secondary bg-secondary/5"
                            )}>
                              {t.valuation}
                            </Badge>
                            <p className="text-[10px] text-muted-foreground max-w-[180px] leading-tight font-medium uppercase tracking-tight">{t.justification}</p>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" className="h-8 text-[9px] uppercase font-black tracking-widest border-border hover:border-secondary hover:text-secondary" onClick={() => evaluateTransfer(t)}>
                            Run Intelligence
                          </Button>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                         <div className="flex justify-end gap-3 opacity-20 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-xl">
                               <Trash2 className="w-4 h-4" />
                            </Button>
                         </div>
                      </td>
                    </tr>
                  ))}
               </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={!!focusedTransfer} onOpenChange={v => !v && setFocusedTransfer(null)}>
        <DialogContent className="bg-background/95 backdrop-blur-xl border-border/50 text-foreground sm:max-w-[800px] p-0">
           {focusedTransfer && (
             <TransferDetailsModal 
               transfer={focusedTransfer} 
               allClubs={allClubs} 
               onEvaluate={() => evaluateTransfer(focusedTransfer)}
               evaluating={evaluating[focusedTransfer.id] || false}
             />
           )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
