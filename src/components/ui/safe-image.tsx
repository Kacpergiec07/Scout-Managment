'use client'

import React, { useState } from 'react'
import Image, { ImageProps } from 'next/image'

interface SafeImageProps extends Omit<ImageProps, 'onError'> {
  fallbackType?: 'player' | 'club' | 'league'
  fallbackName?: string
}

export function SafeImage({ 
  src, 
  alt, 
  fallbackType = 'player', 
  fallbackName, 
  className = '', 
  ...props 
}: SafeImageProps) {
  const [error, setError] = useState(false)
  
  const getFallbackSrc = () => {
    const name = fallbackName || alt || '?'
    const background = fallbackType === 'player' ? '10b981' : fallbackType === 'club' ? '3b82f6' : '6366f1'
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${background}&color=fff&bold=true&font-size=0.33`
  }

  if (!src || error) {
    return (
      <div className={`relative w-full h-full flex items-center justify-center bg-muted/20 ${className}`}>
        <img 
          src={getFallbackSrc()} 
          alt={alt} 
          className="w-full h-full object-contain opacity-50"
        />
      </div>
    )
  }

  return (
    <Image 
      src={src} 
      alt={alt}
      className={`transition-opacity duration-300 ${className}`}
      onError={() => setError(true)}
      unoptimized // Handling external CDNs more reliably
      {...props}
    />
  )
}
