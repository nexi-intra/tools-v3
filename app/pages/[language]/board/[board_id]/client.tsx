"use client"
import { actionBoardSave, actionBoardSaveCopy } from '@/actions/board-actions'
import TileOrganizer from '@/components/tile-organizer'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { usePathname, useRouter } from 'next/navigation'
import React, { useState } from 'react'

export default function ClientPage({ id, initialBoard }: { id: number, initialBoard: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [boardJSON, setboardJSON] = useState("")
  const [error, seterror] = useState("")
  const { toast } = useToast()
  return (
    <div><TileOrganizer
      initialData={initialBoard}
      onStateChange={(json) => { setboardJSON(json) }} />
      <Button onClick={async () => {
        if (!boardJSON) {
          seterror("No board")
          return
        }
        seterror("")
        const saveResult = await actionBoardSave(id, "Updated", boardJSON)
        if (!saveResult.saved || !saveResult.id) {
          seterror("Failed to save: " + saveResult?.error)
          return
        }
        toast({

          description: "Saved",

        })



      }}>Save</Button>

      <Button onClick={async () => {
        if (!boardJSON) {
          seterror("No board")
          return
        }
        seterror("")
        const saveResult = await actionBoardSaveCopy("New", boardJSON)
        if (!saveResult.saved || !saveResult.id) {
          seterror("Failed to save: " + saveResult?.error)
          return
        }
        toast({

          description: "Opening copy  ",

        })

        router.push(saveResult.id.toString())


      }}>Save a copy</Button>

      {error && <div className='text-red-500'>{error}</div>}

    </div>
  )
}

