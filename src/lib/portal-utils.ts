'use client'

import { useEffect, useRef } from 'react'
import { createPortal as reactCreatePortal } from 'react-dom'

/**
 * Export React's native createPortal for use in components
 */
export const createPortal = reactCreatePortal
