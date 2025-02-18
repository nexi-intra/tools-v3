'use client'

import { Suspense, useCallback, useContext, useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { z } from 'zod'
import { ZeroTrust } from '@/components/zero-trust'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ChefHat, Minimize2 } from 'lucide-react'


import { KoksmatSessionProvider, useSession } from './koksmat-provider'
import { createSession, deleteSession, listSessions } from '@/dev/session-manager'
import { ComponentDoc } from '@/components/component-documentation-hub'
import { MagicboxContext } from './magicbox-context'

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
  const { sessionId, setSessionId, isMinimized, setIsMinimized } = useSession()
  const router = useRouter()
  const session = useSession()
  const magicbox = useContext(MagicboxContext)
  const [show, setshow] = useState(false)

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      setshow(true)
      return
    }
    setshow(session.showTool)

  }, [session.showTool])

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  // Only render in development environment
  if (!session.showTool) {
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
      <div style={{ zIndex: "100000000", bottom: "10px" }} className={`fixed bottom-4 right-4   ${className}`}>
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
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2" onClick={toggleMinimize}>
              <CardTitle className="text-sm font-medium">Koksmat Session</CardTitle>

            </CardHeader>
            <CardContent>
              <textarea className="w-full h-96" readOnly>
                {JSON.stringify({ magicbox, session }, null, 2)}

              </textarea>
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
        <Suspense>
          <KoksmatSession />
        </Suspense>
      </KoksmatSessionProvider>
    ),
  },
]