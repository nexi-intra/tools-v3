'use client'

import { useCallback, useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { z } from 'zod'
import { ZeroTrust } from '@/components/zero-trust'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ChefHat, Minimize2 } from 'lucide-react'


import { KoksmatSessionProvider, useKoksmat } from './koksmat-provider'
import { createSession, deleteSession, listSessions } from '@/dev/session-manager'
import { ComponentDoc } from '@/components/component-documentation-hub'

// AI-friendly component description:
// KoksmatSession is a React component that manages session creation, deletion, and reuse.
// It only loads in the development environment and initially displays as a minimized chef's hat icon.
// When expanded, it interacts with server-side functions to handle session operations and displays the current session state.
// It uses the KoksmatProvider context for managing session ID and view state.

const KoksmatSessionSchema = z.object({
  className: z.string().optional(),
})

type KoksmatSessionProps = z.infer<typeof KoksmatSessionSchema>

export default function KoksmatSession({ className = '' }: KoksmatSessionProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { sessionId, setSessionId, isMinimized, setIsMinimized } = useKoksmat()
  const router = useRouter()
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )
  useEffect(() => {
    if (!sessionId) {
      createNewSession()
    } else {
      checkSession(sessionId)
    }
  }, [sessionId])

  const checkSession = async (id: string) => {
    try {
      const sessions = await listSessions()
      if (!sessions.includes(id)) {
        setSessionId(null)
      }
    } catch (err) {
      console.error('Failed to check session:', err)
    }
  }

  const createNewSession = async () => {
    try {
      const newSessionPath = await createSession({ prefix: 'koksmat' })
      const newSessionId = newSessionPath.split('/').pop() || ''
      setSessionId(newSessionId)
      router.push(pathname + '?' + createQueryString('koksmat-sessionid', newSessionId))
      //router.push(`?koksmat-sessionid=${newSessionId}`)
    } catch (err) {
      console.error('Failed to create new session:', err)
    }
  }

  const handleDeleteAndRecreate = async () => {
    if (sessionId) {
      try {
        await deleteSession({ sessionId })
        createNewSession()
      } catch (err) {
        console.error('Failed to delete and recreate session:', err)
      }
    }
  }

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  // Only render in development environment
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <>
      <ZeroTrust
        schema={KoksmatSessionSchema}
        props={{ className }}
        actionLevel="error"
        componentName="KoksmatSession"
      />
      <div className={`fixed bottom-4 right-4 ${className}`}>
        {isMinimized ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={toggleMinimize}
                  variant="outline"
                  size="icon"
                  className="rounded-full bg-white shadow-md"
                >
                  <ChefHat className="h-6 w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Expand Koksmat Session</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Card className="w-80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Koksmat Session</CardTitle>
              <Button
                onClick={toggleMinimize}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-2">Current Session ID: {sessionId || 'None'}</p>
              <div className="flex space-x-2">
                <Button
                  onClick={() => router.push(`?koksmat-sessionid=${sessionId}`)}
                  size="sm"
                  variant="outline"
                  disabled={!sessionId}
                >
                  Reuse Session
                </Button>
                <Button
                  onClick={handleDeleteAndRecreate}
                  size="sm"
                  variant="outline"
                >
                  Delete and Recreate
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}

export const examplesKoksmatSession: ComponentDoc[] = [
  {
    id: 'KoksmatSession',
    name: 'KoksmatSession',
    description: 'A component for managing Koksmat sessions, initially minimized as a chef\'s hat icon. Only visible in development environment. Uses KoksmatProvider for state management.',
    usage: `
      <KoksmatSessionProvider>
        <KoksmatSession />
      </KoksmatSessionProvider>
    `,
    example: (
      <KoksmatSessionProvider>
        <KoksmatSession />
      </KoksmatSessionProvider>
    ),
  },
]