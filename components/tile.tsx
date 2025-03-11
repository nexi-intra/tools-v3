"use client"

import * as LucideIcons from "lucide-react"
import { cn } from "@/lib/utils"
import type { TileType } from "@/components/tile-organizer"
import { Tool } from "@prisma/client"
import { useEffect, useState } from "react"
import { actionToolFindById } from "@/actions/tool-actions"
import { set } from "zod"
import { imgWidth } from "@/lib/image"

interface TileProps {
  tile: TileType
  isDragging?: boolean
}

export function Tile({ tile, isDragging = false }: TileProps) {
  // Dynamically get the icon from Lucide
  const IconComponent = (LucideIcons as any)[tile.icon] || LucideIcons.Square
  const [dbItem, setdbItem] = useState<Tool | null>(null)
  const [loading, setloading] = useState(true)
  useEffect(() => {

    const load = async () => {
      if (!tile.toolId) {
        setloading(false)
        return
      }
      setloading(true)
      const tool = await actionToolFindById(tile.toolId)
      setdbItem(tool)
      setloading(false)
    }
    load()
  }, [tile.toolId])
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-2 bg-background border rounded-md shadow-sm w-16 h-16 cursor-grab",
        isDragging && "opacity-50",
      )}
    >
      {!loading && dbItem?.icon && (
        <img src={imgWidth(dbItem.icon, 32)} alt={dbItem.name} className="w-6 h-6 mb-1" />
      )}
      {!loading && !tile.toolId && (
        <IconComponent className="h-6 w-6 mb-1 text-primary" />
      )}
      <span className="text-xs font-medium truncate w-full text-center">{tile.title}</span>
    </div>
  )
}

