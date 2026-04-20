"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  ArrowRightLeft, 
  ChevronUp, 
  ChevronDown,
  Activity,
  Zap,
  Globe,
  Trash2,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Transfer } from "./transfer-flow";
import { Button } from "@/components/ui/button";

interface GlobalMarketCardProps {
  transfers: any[];
  onSelectTransfer?: (transfer: any) => void;
  onRemoveTransfer?: (id: string) => void;
  onAddTransfer?: () => void;
  onClose?: () => void;
}

export function GlobalMarketCard({ transfers, onSelectTransfer, onRemoveTransfer, onAddTransfer, onClose }: GlobalMarketCardProps) {
  return (
    <div 
      className="relative group flex flex-col isolate overflow-hidden"
      style={{ borderRadius: '2rem' }}
    >
      {/* Visual background layer to ensure perfect rounding clips */}
      <div className="absolute inset-0 bg-card/90 backdrop-blur-3xl border border-border rounded-[2rem] pointer-events-none -z-10 shadow-2xl" />
      
      <div className="relative bg-white/5 border-b border-white/10 p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-2xl font-black italic flex items-center gap-3 text-foreground uppercase tracking-tighter">
              <Activity className="w-6 h-6 text-primary animate-pulse" />
              Global Market Intelligence
            </h3>
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em]">Neural Network Analysis • Real-time Flow</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-12 h-12 bg-accent border border-border text-foreground rounded-2xl hover:bg-accent/80 hover:text-primary transition-all"
              onClick={onClose}
            >
              <ChevronDown className="w-8 h-8" />
            </Button>
            {onAddTransfer && (
              <Button 
                variant="ghost" 
                className="h-12 px-6 bg-primary/10 border border-primary/20 text-primary rounded-2xl hover:bg-primary hover:text-white transition-all shadow-[0_0_20px_rgba(var(--primary),0.2)] flex items-center gap-3 group/add"
                onClick={onAddTransfer}
              >
                <Plus className="w-5 h-5 group-hover/add:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">ADD PLAYER TRANSFER</span>
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-0 flex-1 flex flex-col min-h-0">
        <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-card/95 backdrop-blur-md z-20">
              <tr className="text-[9px] font-black uppercase tracking-widest text-muted-foreground border-b border-border">
                <th className="px-4 py-4">Player & Trajectory</th>
                <th className="px-4 py-4 text-center">Intelligence Analysis</th>
                <th className="px-4 py-4 text-center">Fee</th>
                <th className="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transfers.map((t, idx) => (
                <tr 
                  key={t.id} 
                  className="hover:bg-primary/5 transition-all group/row"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent border border-border p-0.5 overflow-hidden group-hover/row:scale-110 transition-transform flex-shrink-0">
                        <img 
                          src={t.photoUrl || "/globe.svg"} 
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                        <div className="flex-1 flex flex-col">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-black text-foreground group-hover/row:text-primary transition-colors uppercase italic pr-2 whitespace-nowrap">{t.playerName}</div>
                          {t.position && (
                            <Badge variant="outline" className="text-[8px] h-4 bg-primary/10 border-primary/20 text-primary uppercase font-bold px-1.5 shrink-0">
                              {t.position}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 whitespace-nowrap">
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">{t.fromTeamName}</span>
                          <ArrowRightLeft className="w-2.5 h-2.5 text-muted-foreground/30" />
                          <span className="text-[10px] font-black text-primary uppercase tracking-tighter">{t.toTeamName}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Button 
                      onClick={() => onSelectTransfer?.(t)}
                      variant="outline" 
                      size="sm" 
                      className="bg-primary/10 border-primary/20 text-primary hover:bg-primary hover:text-white rounded-full text-[10px] font-black uppercase tracking-widest px-4 h-8"
                    >
                      Analyze Impact
                    </Button>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="text-sm font-black text-foreground tabular-nums font-mono">{t.fee}</div>
                    <div className="text-[9px] text-muted-foreground uppercase font-black font-mono mt-0.5">EST. {t.marketValue}</div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveTransfer?.(t.id);
                      }}
                      className="text-muted-foreground/40 hover:text-rose-500 hover:bg-rose-500/10 transition-all rounded-full h-9 w-9"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
