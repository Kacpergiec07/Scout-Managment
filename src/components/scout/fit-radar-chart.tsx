"use client";

import React, { useState, useEffect } from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface FitRadarChartProps {
  playerFitData?: any[];
  overallFit?: number;
}

export function FitRadarChart({ playerFitData, overallFit = 88 }: FitRadarChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const defaultData = [
    { category: "Pace", current: 85, fit: 92 },
    { category: "Passing", current: 78, fit: 85 },
    { category: "Dribbling", current: 82, fit: 88 },
    { category: "Defense", current: 40, fit: 45 },
    { category: "Physical", current: 70, fit: 75 },
    { category: "Finishing", current: 88, fit: 95 },
  ];

  const data = playerFitData || defaultData;

  const chartConfig = {
    current: {
      label: "Current",
      color: "#0ea5e9", // Light Blue
    },
    fit: {
      label: "Projected Fit",
      color: "#f59e0b", // Gold/Orange
    },
  } satisfies ChartConfig;

  if (!mounted) return null;

  return (
    <div className="relative w-full h-[320px] flex items-center justify-center bg-accent/20 rounded-2xl border border-border overflow-hidden group">
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground) / 0.05) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground) / 0.05) 1px, transparent 1px)`,
          backgroundSize: '30px 30px'
        }}
      />
      
      {/* Cyber Corner Accents */}
      <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[#f59e0b]/30" />
      <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[#f59e0b]/30" />

      <div className="absolute left-8 top-1/2 -translate-y-1/2 z-10 flex flex-col justify-center">
         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Fit Analysis</p>
         <div className="text-7xl font-black text-foreground tracking-tighter drop-shadow-[0_0_20px_rgba(245,158,11,0.2)] flex items-end">
           {overallFit}<span className="text-4xl text-[#f59e0b]"> %</span>
         </div>
         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f59e0b] mt-2">Neural Accuracy</p>
      </div>

      <div className="w-[320px] h-[320px] absolute right-0">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <RadarChart data={data} margin={{ top: 30, right: 30, bottom: 30, left: 30 }}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarGrid stroke="hsl(var(--foreground) / 0.1)" strokeDasharray="3 3" />
            <PolarAngleAxis 
              dataKey="category" 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 800 }} 
            />
            {/* Current Stats (Inner Hexagon) */}
            <Radar
              name="Current Profile"
              dataKey="current"
              stroke="#0ea5e9"
              strokeWidth={2}
              fill="#0ea5e9"
              fillOpacity={0.2}
              dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 0 }}
            />
            {/* Projected Fit (Outer Hexagon) */}
            <Radar
              name="Tactical Potential"
              dataKey="fit"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="#f59e0b"
              fillOpacity={0.15}
              dot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }}
            />
          </RadarChart>
        </ChartContainer>
      </div>

      {/* Decorative Crosshairs */}
      <div className="absolute left-0 top-1/2 w-4 h-px bg-foreground/20" />
      <div className="absolute right-0 top-1/2 w-4 h-px bg-foreground/20" />
    </div>
  );
}
