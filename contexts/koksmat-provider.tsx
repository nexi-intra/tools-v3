'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'

// Define the shape of the context
interface KoksmatContextType {
  sessionId: string | null
  setSessionId: (id: string | null) => void
  isMinimized: boolean
  setIsMinimized: (minimized: boolean) => void
}

// Create the context
const KoksmatContext = createContext<KoksmatContextType | undefined>(undefined)

// Define props for the provider component
interface KoksmatProviderProps {
  children: ReactNode
}

export function KoksmatProvider({ children }: KoksmatProviderProps) {

  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isMinimized, setIsMinimized] = useState(true)
  const searchParams = useSearchParams()
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )
  useEffect(() => {
    const sessionIdFromUrl = searchParams.get('koksmat-sessionid')
    if (sessionIdFromUrl) {
      setSessionId(sessionIdFromUrl)
    }
  }, [searchParams])

  const value = {
    sessionId,
    setSessionId,
    isMinimized,
    setIsMinimized,
  }

  return <KoksmatContext.Provider value={value}>{children}</KoksmatContext.Provider>
}

// Custom hook to use the Koksmat context
export function useKoksmat() {
  const context = useContext(KoksmatContext)
  if (context === undefined) {
    throw new Error('useKoksmat must be used within a KoksmatProvider')
  }
  return context
}

// ZeroTrust schema for the KoksmatProvider
import { z } from 'zod'
import { ComponentDoc } from '@/components/component-documentation-hub'

const KoksmatProviderSchema = z.object({
  children: z.any(),
})

// Wrapper component with ZeroTrust
export function KoksmatSessionProvider({ children }: KoksmatProviderProps) {
  return (
    <>
      <KoksmatProvider>{children}</KoksmatProvider>
    </>
  )
}

// Example usage


export const examplesKoksmatProvider: ComponentDoc[] = [
  {
    id: 'KoksmatProvider',
    name: 'KoksmatProvider',
    description: 'A context provider for managing Koksmat session state and view state.',
    usage: `
      <KoksmatSessionProvider>
        <YourApp />
      </KoksmatSessionProvider>
    `,
    example: (
      <KoksmatSessionProvider>
        <div>Your app content here</div>
      </KoksmatSessionProvider>
    ),
  },
]