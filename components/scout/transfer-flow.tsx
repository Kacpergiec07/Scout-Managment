"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, ArrowRightLeft, TrendingUp, Info } from "lucide-react";
import { getTransfersAction, getTeamDetailsAction } from "@/app/actions/statorium";
import { StatoriumTransfer } from "@/lib/statorium/types";
import { geocodeCity, getCachedGeocode, GeoPoint } from "@/lib/utils/geocoding";
import { motion, AnimatePresence } from "framer-motion";
import "leaflet/dist/leaflet.css";

// Dynamic import for Leaflet map to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import("react-leaflet").then((mod) => mod.CircleMarker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then((mod) => mod.Polyline), { ssr: false });

interface TeamLocation {
  id: string;
  name: string;
  pos: [number, number];
}

interface ValuationData {
  valuation: "Underpriced" | "Fair" | "Overpriced";
  justification: string;
}

export function TransferFlow({ teamId = "1" }: { teamId?: string }) {
  const [transfers, setTransfers] = useState<StatoriumTransfer[]>([]);
  const [teamLocations, setTeamLocations] = useState<Record<string, TeamLocation>>({});
  const [loading, setLoading] = useState(true);
  const [valuations, setValuations] = useState<Record<string, ValuationData>>({});
  const [evaluating, setEvaluating] = useState<Record<string, boolean>>({});

  const transfersByClub = useMemo(() => {
    const clubMap: Record<string, StatoriumTransfer[]> = {};
    transfers.forEach(t => {
      if (!clubMap[t.fromTeamID]) clubMap[t.fromTeamID] = [];
      if (!clubMap[t.toTeamID]) clubMap[t.toTeamID] = [];
      // Avoid duplicate entries if a player is transferred multiple times within same dataset
      if (!clubMap[t.fromTeamID].find(existing => existing.playerID === t.playerID)) {
        clubMap[t.fromTeamID].push(t);
      }
      if (!clubMap[t.toTeamID].find(existing => existing.playerID === t.playerID)) {
        clubMap[t.toTeamID].push(t);
      }
    });
    return clubMap;
  }, [transfers]);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const data = await getTransfersAction(teamId);
        // Fallback for demo if no transfers
        const demoTransfers: StatoriumTransfer[] = data.length > 0 ? data : [
          { playerID: "1", playerName: "Robert Lewandowski", fromTeamID: "1", fromTeamName: "Bayern Munich", toTeamID: "2", toTeamName: "FC Barcelona", date: "2022-07-19", season: "2022/23", type: "Out", fee: "€45M" },
          { playerID: "2", playerName: "Jude Bellingham", fromTeamID: "3", fromTeamName: "Dortmund", toTeamID: "4", toTeamName: "Real Madrid", date: "2023-06-14", season: "2023/24", type: "In", fee: "€103M" },
          { playerID: "3", playerName: "Erling Haaland", fromTeamID: "3", fromTeamName: "Dortmund", toTeamID: "5", toTeamName: "Man City", date: "2022-05-10", season: "2022/23", type: "Out", fee: "€60M" },
          { playerID: "4", playerName: "Harry Kane", fromTeamID: "6", fromTeamName: "Tottenham", toTeamID: "1", toTeamName: "Bayern Munich", date: "2023-08-12", season: "2023/24", type: "In", fee: "€100M" }
        ];
        
        setTransfers(demoTransfers);

        // Fetch team locations
        const locations: Record<string, TeamLocation> = {};
        const uniqueTeams = new Set<string>();
        demoTransfers.forEach(t => {
          uniqueTeams.add(t.fromTeamID);
          uniqueTeams.add(t.toTeamID);
        });

        for (const tid of Array.from(uniqueTeams)) {
          const teamName = demoTransfers.find(t => t.fromTeamID === tid)?.fromTeamName || 
                           demoTransfers.find(t => t.toTeamID === tid)?.toTeamName || "";
          
          const cached = getCachedGeocode(teamName);
          if (cached) {
            locations[tid] = { id: tid, name: teamName, pos: [cached.lat, cached.lng] };
          } else {
            const res = await geocodeCity(teamName);
            if (res) {
              locations[tid] = { id: tid, name: teamName, pos: [res.lat, res.lng] };
            }
          }
        }
        setTeamLocations(locations);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [teamId]);

  const evaluateTransfer = async (transfer: StatoriumTransfer) => {
    const key = `${transfer.playerID}-${transfer.date}`;
    if (valuations[key]) return;

    setEvaluating(prev => ({ ...prev, [key]: true }));
    try {
      const response = await fetch('/api/valuation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: transfer.playerName,
          age: 25, // Mock age
          stats: { goals: 15, assists: 10 }, // Mock stats
          fee: transfer.fee || "Unknown",
          season: transfer.season
        })
      });
      const data = await response.json();
      setValuations(prev => ({ ...prev, [key]: data }));
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(prev => ({ ...prev, [key]: false }));
    }
  };

  const getBezierPoints = (start: [number, number], end: [number, number], segments = 50) => {
    const points: [number, number][] = [];
    const midX = (start[0] + end[0]) / 2;
    const midY = (start[1] + end[1]) / 2;
    
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const normalX = -dy;
    const normalY = dx;
    const length = Math.sqrt(normalX * normalX + normalY * normalY);
    const curvature = 0.25; // More pronounced curve
    
    // Control point shifted perpendicular to the path
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-white/50">Mapping transfer flows...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Map Section */}
      <Card className="overflow-hidden border-white/10 bg-black/40 backdrop-blur-xl">
        <CardHeader className="bg-white/5 border-b border-white/10">
          <CardTitle className="text-xl flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Global Transfer Flow
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 relative h-[500px]">
          <MapContainer 
            center={[48.8566, 2.3522]} 
            zoom={4} 
            className="h-full w-full"
            style={{ background: '#111' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            
            {/* Markers */}
            {Object.values(teamLocations).map((loc) => (
              <CircleMarker 
                key={loc.id} 
                center={loc.pos} 
                pathOptions={{ 
                  color: '#3b82f6', 
                  fillColor: '#3b82f6', 
                  fillOpacity: 0.8,
                  weight: 2,
                  className: 'marker-pulse'
                }} 
                radius={5}
              >
                <Popup>
                  <div className="min-w-[150px]">
                    <div className="font-bold text-zinc-900 border-b border-zinc-100 pb-1 mb-2">{loc.name}</div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest mb-1">Involved Players</p>
                      {transfersByClub[loc.id]?.map((t) => (
                        <div key={t.playerID} className="flex items-center justify-between text-xs group">
                          <span className="text-zinc-600 truncate max-w-[100px]">{t.playerName}</span>
                          <Link 
                            href={`/analysis?id=${t.playerID}&name=${encodeURIComponent(t.playerName)}`}
                            className="text-primary hover:text-primary-dark font-bold ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Details &rarr;
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

            {/* Flows */}
            {transfers.map((t, idx) => {
              const start = teamLocations[t.fromTeamID]?.pos;
              const end = teamLocations[t.toTeamID]?.pos;
              if (!start || !end) return null;

              const points = getBezierPoints(start, end);
              const color = t.type === 'In' ? '#4ade80' : '#f87171'; // Brighter neon-ish colors

              return (
                <Polyline 
                  key={idx} 
                  positions={points} 
                  pathOptions={{ 
                    color: color, 
                    weight: 2, 
                    opacity: 0.8,
                    className: 'transfer-flow-line',
                  }} 
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold text-lg">{t.playerName}</p>
                      <p className="text-white/70">From: {t.fromTeamName}</p>
                      <p className="text-white/70">To: {t.toTeamName}</p>
                      <p className="mt-1 text-primary font-mono">{t.fee || 'Free Transfer'}</p>
                      <p className="text-xs text-white/50">{t.season}</p>
                    </div>
                  </Popup>
                </Polyline>
              );
            })}
          </MapContainer>
        </CardContent>
      </Card>

      {/* Table Section */}
      <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
        <CardHeader className="bg-white/5 border-b border-white/10">
          <CardTitle className="text-xl flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-primary" />
            Transfer Intelligence Log
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/10 text-xs font-medium text-white/50 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Player</th>
                <th className="px-6 py-4">Flow</th>
                <th className="px-6 py-4">Fee</th>
                <th className="px-6 py-4">AI Valuation</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transfers.map((t) => {
                const key = `${t.playerID}-${t.date}`;
                const val = valuations[key];
                const isEval = evaluating[key];

                return (
                  <tr key={key} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-white">{t.playerName}</div>
                        <div className="flex gap-1 mt-1">
                          <Badge variant="outline" className="text-[8px] h-3 px-1 border-white/20 text-white/40">
                            {t.playerName.includes("Lewandowski") ? "Target Man" : t.playerName.includes("Bellingham") ? "B2B" : "Poacher"}
                          </Badge>
                          <Badge variant="outline" className="text-[8px] h-3 px-1 border-white/20 text-white/40">
                             Right Foot
                          </Badge>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-white/60">{t.fromTeamName}</span>
                        <ArrowRightLeft className={`w-3 h-3 ${t.type === 'In' ? 'text-green-400 rotate-180' : 'text-red-400'}`} />
                        <span className="text-white/60">{t.toTeamName}</span>
                        <Badge variant={t.type === 'In' ? 'default' : 'destructive'} className="ml-2 text-[10px] scale-75 h-4">
                          {t.type}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-primary">
                      {t.fee || "Unknown"}
                    </td>
                    <td className="px-6 py-4">
                      {val ? (
                        <div className="flex flex-col gap-1">
                          <Badge 
                            variant="outline" 
                            className={`w-fit text-[10px] ${
                              val.valuation === 'Underpriced' ? 'border-green-500 text-green-400 bg-green-500/10' :
                              val.valuation === 'Overpriced' ? 'border-red-500 text-red-400 bg-red-500/10' :
                              'border-blue-500 text-blue-400 bg-blue-500/10'
                            }`}
                          >
                            {val.valuation}
                          </Badge>
                          <p className="text-[10px] text-white/50 max-w-[200px] italic leading-tight">
                            {val.justification}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-white/20 italic">No appraisal</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!val && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 gap-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={isEval}
                          onClick={() => evaluateTransfer(t)}
                        >
                          {isEval ? <Loader2 className="w-3 h-3 animate-spin"/> : <TrendingUp className="w-3 h-3" />}
                          Scout AI
                        </Button>
                      )}
                      {val && (
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Info className="w-4 h-4 text-white/30" />
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
