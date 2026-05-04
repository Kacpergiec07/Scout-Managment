/**
 * Player Avatar Component
 * Displays player photo with placeholder fallback
 */
'use client'

import { useState } from 'react'

export function PlayerAvatar({ photo, size = 40 }: { photo?: string | null; size?: number }) {
  const [imgError, setImgError] = useState(false)

  if (!photo || imgError) {
    return (
      <div style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: '#2a3a4a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <svg viewBox="0 0 100 100" width={size * 0.6} height={size * 0.6}
             fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="35" r="22" fill="#4a5568"/>
          <ellipse cx="50" cy="88" rx="34" ry="24" fill="#4a5568"/>
        </svg>
      </div>
    )
  }

  return (
    <img
      src={photo}
      alt=""
      width={size}
      height={size}
      style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      onError={() => setImgError(true)}
    />
  )
}
