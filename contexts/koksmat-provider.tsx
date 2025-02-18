'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

// Define the shape of the context
interface SessionContextType {
  sessionId: string | null
  setSessionId: (id: string | null) => void
  isMinimized: boolean
  setIsMinimized: (minimized: boolean) => void
  signIn: (accessToken: string) => void
  token: string
  showTool: boolean
  setShowTool: (onOff: boolean) => void
}

// Create the context
const SessionContext = createContext<SessionContextType | undefined>(undefined)

// Define props for the provider component
interface SessionProviderProps {
  children: ReactNode
}

export function SessionProvider({ children }: SessionProviderProps) {
  const magicbox = useContext(MagicboxContext)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isMinimized, setIsMinimized] = useState(true)
  const [token, setToken] = useState("")
  const searchParams = useSearchParams()
  const [showTool, setShowTool] = useState(false)
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

  useEffect(() => {
    const load = async () => {
      if (!magicbox.authtoken) {
        return
      }
      const token = await actionSignIn(magicbox.authtoken)
      setToken(token)
    }
    load()
  }, [magicbox.authtoken])

  const signIn = async (accessToken: string) => {
    debugger
    const token = await actionSignIn(accessToken)
    setToken(token)
  }
  const value = {
    sessionId,
    setSessionId,
    isMinimized,
    setIsMinimized,
    token,
    showTool,
    setShowTool,
    signIn
  }

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

// Custom hook to use the Koksmat context
export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useKoksmat must be used within a KoksmatProvider')
  }
  return context
}

// ZeroTrust schema for the KoksmatProvider
import { z } from 'zod'
import { ComponentDoc } from '@/components/component-documentation-hub'
import { MagicboxContext } from './magicbox-context'
import { actionSignIn } from '@/actions/session-actions'

const KoksmatProviderSchema = z.object({
  children: z.any(),
})

// Wrapper component with ZeroTrust
export function KoksmatSessionProvider({ children }: SessionProviderProps) {
  return (
    <>
      <Suspense>
        <SessionProvider>{children}</SessionProvider>
      </Suspense>
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