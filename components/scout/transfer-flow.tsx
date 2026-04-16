"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Loader2, MapPin, ArrowRightLeft, TrendingUp, Info, 
  Plus, X, Search, Trash2, Brain 
} from "lucide-react";
import { 
  getAllTop5ClubsAction, 
  getPlayersAction,
  getStandingsAction // Added for club data fallback
} from "@/app/actions/statorium";
import { geocodeCity, getCachedGeocode, GeoPoint } from "@/lib/utils/geocoding";
import { motion, AnimatePresence } from "framer-motion";
import "leaflet/dist/leaflet.css";

// Dynamic imports for Leaflet to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import("react-leaflet").then((mod) => mod.CircleMarker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then((mod) => mod.Polyline), { ssr: false });
const useMap = dynamic(() => import("react-leaflet").then((mod) => mod.useMap), { ssr: false });

// This needs to be a regular import if possible, but react-leaflet components usually work better inside MapContainer
// I'll define it as a simple component.
const L = typeof window !== 'undefined' ? require('leaflet') : null;

interface Transfer {
  id: string;
  playerName: string;
  playerID: string;
  fromClub: string;
  fromClubID: string;
  toClub: string;
  toClubID: string;
  fee: string;
  color: string;
  route: [number, number][];
}

interface Club {
  id: string;
  name: string;
  logo: string;
  seasonId: string;
}

interface Player {
  playerID: string;
  fullName: string;
  photo: string;
  additionalInfo?: {
    position?: string;
    birthdate?: string;
  };
}

// Custom hook to handle animated dots on the map
function MovingDot({ positions, color }: { positions: [number, number][], color: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (positions.length < 2) return;
    
    let animationId: number;
    const speed = 0.002; // Slower and smoother
    let progress = 0;

    const animate = () => {
      progress += speed;
      if (progress >= 1) progress = 0;
      
      const setIdx = Math.floor(progress * (positions.length - 1));
      if (setIdx !== index) {
        setIndex(setIdx);
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [positions, index]);

  if (!positions[index]) return null;

  return (
    <CircleMarker
      center={positions[index]}
      pathOptions={{
        color: color,
        fillColor: color,
        fillOpacity: 1,
        weight: 0,
        className: 'transfer-dot'
      }}
      radius={5}
    />
  );
}

export function TransferFlow() {
  // ... existing state ...
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [allClubs, setAllClubs] = useState<Club[]>([]);
  const [loadingClubs, setLoadingClubs] = useState(false);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teamLocations, setTeamLocations] = useState<Record<string, GeoPoint>>({});
  
  // Form State
  const [fromClubSearch, setFromClubSearch] = useState("");
  const [toClubSearch, setToClubSearch] = useState("");
  const [playerSearch, setPlayerSearch] = useState("");
  const [selectedFromClub, setSelectedFromClub] = useState<Club | null>(null);
  const [selectedToClub, setSelectedToClub] = useState<Club | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [transferFee, setTransferFee] = useState("");
  const [routeColor, setRouteColor] = useState("#3b82f6");
  const [error, setError] = useState<string | null>(null);
  // ... existing logic ...

  // Initialize Clubs
  useEffect(() => {
    async function fetchClubs() {
      setLoadingClubs(true);
      setError(null);
      try {
        const clubs = await getAllTop5ClubsAction();
        setAllClubs(clubs);
      } catch (err) {
        setError("API Connection Error.");
      } finally {
        setLoadingClubs(false);
      }
    }
    fetchClubs();
  }, []);

  // Fetch Players when From Club changes
  useEffect(() => {
    async function fetchPlayers() {
      if (!selectedFromClub) {
        setAvailablePlayers([]);
        return;
      }
      setLoadingPlayers(true);
      try {
        const players = await getPlayersAction(selectedFromClub.id, selectedFromClub.seasonId);
        setAvailablePlayers(players);
      } catch (err) {
        console.error("Failed to fetch players", err);
      } finally {
        setLoadingPlayers(false);
      }
    }
    fetchPlayers();
  }, [selectedFromClub]);

  // Geocode clubs as they are selected to ensure map works
  const geocodeClub = async (clubName: string, clubId: string) => {
    if (teamLocations[clubId]) return teamLocations[clubId];
    
    const cached = getCachedGeocode(clubName);
    if (cached) {
      setTeamLocations(prev => ({ ...prev, [clubId]: cached }));
      return cached;
    }

    const geo = await geocodeCity(clubName);
    if (geo) {
      setTeamLocations(prev => ({ ...prev, [clubId]: geo }));
      return geo;
    }
    return null;
  };

  const getBezierPoints = (start: [number, number], end: [number, number], segments = 100) => {
    const points: [number, number][] = [];
    const midX = (start[0] + end[0]) / 2;
    const midY = (start[1] + end[1]) / 2;
    
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const normalX = -dy;
    const normalY = dx;
    const length = Math.sqrt(normalX * normalX + normalY * normalY);
    const curvature = 0.2; 
    
    const cp = [
      midX + (normalX / (length || 1)) * curvature * length,
      midY + (normalY / (length || 1)) * curvature * length
    ] as [number, number];

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = (1 - t) * (1 - t) * start[0] + 2 * (1 - t) * t * cp[0] + t * t * end[0];
      const y = (1 - t) * (1 - t) * start[1] + 2 * (1 - t) * t * cp[1] + t * t * end[1];
      points.push([x, y]);
    }
    return points;
  };

  const addTransfer = async () => {
    if (!selectedFromClub || !selectedToClub || !selectedPlayer) return;

    const startLoc = await geocodeClub(selectedFromClub.name, selectedFromClub.id);
    const endLoc = await geocodeClub(selectedToClub.name, selectedToClub.id);

    if (!startLoc || !endLoc) {
      alert("Could not locate clubs on map.");
      return;
    }

    const route = getBezierPoints([startLoc.lat, startLoc.lng], [endLoc.lat, endLoc.lng]);

    const newTransfer: Transfer = {
      id: Math.random().toString(36).substr(2, 9),
      playerName: selectedPlayer.fullName,
      playerID: selectedPlayer.playerID,
      fromClub: selectedFromClub.name,
      fromClubID: selectedFromClub.id,
      toClub: selectedToClub.name,
      toClubID: selectedToClub.id,
      fee: transferFee || "€0",
      color: routeColor,
      route: route
    };

    setTransfers(prev => [...prev, newTransfer]);
    setIsModalOpen(false);
  };

  const deleteTransfer = (id: string) => {
    setTransfers(prev => prev.filter(t => t.id !== id));
  };

  // Filtered dropdown lists
  const filteredFromClubs = allClubs.filter(c => 
    c.name.toLowerCase().includes(fromClubSearch.toLowerCase())
  ).slice(0, 5);

  const filteredToClubs = allClubs.filter(c => 
    c.name.toLowerCase().includes(toClubSearch.toLowerCase()) && 
    c.id !== selectedFromClub?.id
  ).slice(0, 5);

  const filteredPlayers = availablePlayers.filter(p => 
    p.fullName.toLowerCase().includes(playerSearch.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="space-y-8 p-6 bg-zinc-950 min-h-screen text-zinc-100">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3">
             <MapPin className="text-emerald-500 w-8 h-8" />
             GLOBAL TRANSFER FLOW
          </h1>
          <p className="text-zinc-500 font-medium">Real-time market movement visualizer for top European leagues.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Transfer
        </Button>
      </div>

      <Card className="overflow-hidden border-zinc-800 bg-zinc-900/50 backdrop-blur-3xl shadow-2xl relative h-[600px]">
        <MapContainer 
          center={[48.8566, 2.3522]} 
          zoom={4} 
          className="h-full w-full"
          style={{ background: '#09090b' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          <AnimatePresence>
            {transfers.map((t) => (
              <div key={t.id}>
                <Polyline 
                  positions={t.route} 
                  pathOptions={{ 
                    color: t.color, 
                    weight: 2, 
                    opacity: 0.6,
                    dashArray: '5, 10'
                  }} 
                />
                <MovingDot positions={t.route} color={t.color} />
              </div>
            ))}
          </AnimatePresence>
        </MapContainer>
        
        {/* Map Legend/Overlay */}
        <div className="absolute top-6 right-6 z-[1000] p-4 bg-zinc-900/90 border border-zinc-800 rounded-2xl backdrop-blur-md">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">ACTIVE FLOWS</h4>
          <div className="text-2xl font-black text-white">{transfers.length}</div>
        </div>
      </Card>

      {/* Transfer Intelligence Log */}
      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-3xl shadow-2xl overflow-hidden">
        <CardHeader className="border-b border-zinc-800 p-6 flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-3">
            <ArrowRightLeft className="text-emerald-500 w-5 h-5" />
            Transfer Intelligence Log
          </CardTitle>
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-500 uppercase text-[10px] tracking-widest">
            LIVE ANALYTICS
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-800/30 border-b border-zinc-800 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-4">Player</th>
                  <th className="px-8 py-4">Flow (Source → Target)</th>
                  <th className="px-8 py-4">Fee</th>
                  <th className="px-8 py-4">AI Valuation</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {transfers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-zinc-600 italic">
                      No active transfer data mapped. Click "Add Transfer" to start tracking movements.
                    </td>
                  </tr>
                ) : (
                  transfers.map((t) => (
                    <tr key={t.id} className="hover:bg-zinc-800/20 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="font-bold text-white text-lg">{t.playerName}</div>
                        <div className="text-xs text-zinc-500 uppercase tracking-tighter">Verified Market Entry</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3 font-black">
                          <span style={{ color: t.color }}>{t.fromClub}</span>
                          <span style={{ color: t.color }}>→</span>
                          <span style={{ color: t.color }}>{t.toClub}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-emerald-500 font-mono font-bold">{t.fee}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                           <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                           <span className="text-xs font-bold text-zinc-400">FAIR VALUE TARGET</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right space-x-2">
                        <Button variant="ghost" size="sm" className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg">
                          <Brain className="w-4 h-4 mr-2" />
                          Scout AI
                        </Button>
                        <Button 
                          onClick={() => deleteTransfer(t.id)}
                          variant="ghost" 
                          size="sm" 
                          className="text-zinc-600 hover:text-red-500 border border-zinc-800 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add Transfer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-[2rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 border-b border-zinc-800 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-white">MAP NEW FLOW</h2>
                <p className="text-zinc-500 text-sm">Query Statorium API for real-time club movements.</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="rounded-full">
                <X className="w-6 h-6" />
              </Button>
            </div>

            <div className="p-8 space-y-6">
              {/* From Club */}
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">From Club</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <Input 
                    placeholder="Search clubs..."
                    value={fromClubSearch}
                    onChange={(e) => {
                      setFromClubSearch(e.target.value);
                      setSelectedFromClub(null);
                      setSelectedPlayer(null);
                    }}
                    className="pl-10 h-14 bg-zinc-800 border-zinc-700 rounded-xl focus:ring-emerald-500"
                  />
                </div>
                {fromClubSearch && !selectedFromClub && (
                  <div className="absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden">
                    {filteredFromClubs.map(c => (
                      <div 
                        key={c.id} 
                        onClick={() => {
                          setSelectedFromClub(c);
                          setFromClubSearch(c.name);
                        }}
                        className="px-4 py-3 hover:bg-emerald-500/10 cursor-pointer text-zinc-100 flex items-center justify-between group"
                      >
                        <span className="font-bold">{c.name}</span>
                        <span className="text-[10px] text-zinc-600 uppercase group-hover:text-emerald-500 font-black">Select →</span>
                      </div>
                    ))}
                    {filteredFromClubs.length === 0 && <div className="p-4 text-zinc-500 italic text-sm">No clubs found</div>}
                  </div>
                )}
              </div>

              {/* Player */}
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Player</label>
                <Input 
                  placeholder="Select club first..."
                  disabled={!selectedFromClub}
                  value={playerSearch}
                  onChange={(e) => {
                    setPlayerSearch(e.target.value);
                    setSelectedPlayer(null);
                  }}
                  className="h-14 bg-zinc-800 border-zinc-700 rounded-xl focus:ring-emerald-500 disabled:opacity-30"
                />
                {loadingPlayers && <Loader2 className="absolute right-4 top-[3.25rem] w-4 h-4 animate-spin text-emerald-500" />}
                {playerSearch && !selectedPlayer && selectedFromClub && (
                  <div className="absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden">
                    {filteredPlayers.map(p => (
                      <div 
                        key={p.playerID} 
                        onClick={() => {
                          setSelectedPlayer(p);
                          setPlayerSearch(p.fullName);
                          setTransferFee("€" + (Math.floor(Math.random() * 80) + 20) + "M"); // Auto-fill mock market value
                        }}
                        className="px-4 py-3 hover:bg-emerald-500/10 cursor-pointer text-zinc-100 flex items-center justify-between group"
                      >
                         <div className="flex flex-col">
                           <span className="font-bold">{p.fullName}</span>
                           <span className="text-[10px] text-zinc-500">{p.additionalInfo?.position}</span>
                         </div>
                         <span className="text-[10px] text-emerald-500 font-black">Verify Data</span>
                      </div>
                    ))}
                    {filteredPlayers.length === 0 && !loadingPlayers && <div className="p-4 text-zinc-500 italic text-sm">No players found in {selectedFromClub.name}</div>}
                  </div>
                )}
              </div>

              {/* To Club */}
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">To Club</label>
                <Input 
                  placeholder="Search target club..."
                  value={toClubSearch}
                  onChange={(e) => {
                    setToClubSearch(e.target.value);
                    setSelectedToClub(null);
                  }}
                  className="h-14 bg-zinc-800 border-zinc-700 rounded-xl focus:ring-emerald-500"
                />
                {toClubSearch && !selectedToClub && (
                  <div className="absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden">
                    {filteredToClubs.map(c => (
                      <div 
                        key={c.id} 
                        onClick={() => {
                          setSelectedToClub(c);
                          setToClubSearch(c.name);
                        }}
                        className="px-4 py-3 hover:bg-emerald-500/10 cursor-pointer text-zinc-100 flex items-center justify-between group"
                      >
                        <span className="font-bold">{c.name}</span>
                        <span className="text-[10px] text-emerald-500 font-black">Set Destination</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Fee */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Transfer Fee</label>
                  <Input 
                    value={transferFee}
                    onChange={(e) => setTransferFee(e.target.value)}
                    className="h-14 bg-zinc-800 border-zinc-700 rounded-xl font-mono text-emerald-500 font-bold"
                  />
                </div>
                {/* Color */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Route Color</label>
                  <div className="flex items-center gap-4 h-14 px-4 bg-zinc-800 border border-zinc-700 rounded-xl">
                    <input 
                      type="color" 
                      value={routeColor}
                      onChange={(e) => setRouteColor(e.target.value)}
                      className="cursor-pointer bg-transparent border-none w-10 h-10 p-0"
                    />
                    <span className="text-xs font-mono text-zinc-400">{routeColor.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              <Button 
                onClick={addTransfer}
                disabled={!selectedFromClub || !selectedToClub || !selectedPlayer}
                className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-emerald-500/20 disabled:opacity-50"
              >
                INITIALIZE TRANSFER FLOW
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
