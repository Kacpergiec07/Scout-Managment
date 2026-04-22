'use client';

import { useMarketValue } from '@/hooks/use-market-value';
import { cn } from '@/lib/utils';
import { TrendingUp, Wallet } from 'lucide-react';

interface MarketValueProps {
  playerName: string;
  className?: string;
  showIcon?: boolean;
}

export function MarketValue({ playerName, className, showIcon = true }: MarketValueProps) {
  const { data, isLoading } = useMarketValue(playerName);

  if (isLoading) {
    return (
      <div className={cn("animate-pulse bg-muted rounded-md h-6 w-20", className)} />
    );
  }

  const value = data?.formatted || 'N/A';
  const isAvailable = value !== 'N/A';

  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-bold transition-all duration-300",
        isAvailable 
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20" 
          : "bg-muted text-muted-foreground border border-transparent",
        className
      )}
    >
      {showIcon && <Wallet className="w-3 h-3" />}
      <span className="tracking-tight uppercase">
        {isAvailable ? value : 'N/A'}
      </span>
      {isAvailable && (
        <TrendingUp className="w-3 h-3 opacity-50 ml-0.5" />
      )}
    </div>
  );
}
