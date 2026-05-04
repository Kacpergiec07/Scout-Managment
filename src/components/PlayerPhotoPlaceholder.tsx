/**
 * Player Photo Placeholder Component
 * SVG placeholder for missing player photos
 */

export function PlayerPhotoPlaceholder({ className = '', size = 100 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="100" height="100" fill="#1e2a3a" />
      <circle cx="50" cy="38" r="18" fill="#4a5568" />
      <ellipse cx="50" cy="90" rx="32" ry="22" fill="#4a5568" />
    </svg>
  )
}

/**
 * Player Photo with Fallback Component
 * Renders player photo with placeholder on error or when photo is null/empty
 */
export function PlayerPhotoWithFallback({
  photoUrl,
  playerName,
  className = '',
  showPlaceholder = false
}: {
  photoUrl?: string | null;
  playerName: string;
  className?: string;
  showPlaceholder?: boolean;
}) {
  const [showFallback, setShowFallback] = React.useState(showPlaceholder);

  if (showFallback || !photoUrl) {
    return (
      <PlayerPhotoPlaceholder className={className} />
    )
  }

  return (
    <img
      src={photoUrl}
      alt={playerName}
      className={className}
      onError={(e) => {
        setShowFallback(true);
      }}
    />
  )
}

import React from 'react'
