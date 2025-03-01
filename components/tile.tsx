"use client"

import * as LucideIcons from "lucide-react"
import { cn } from "@/lib/utils"
import type { TileType } from "@/components/tile-organizer"

interface TileProps {
  tile: TileType
  isDragging?: boolean
}

export function Tile({ tile, isDragging = false }: TileProps) {
  // Dynamically get the icon from Lucide
  const IconComponent = (LucideIcons as any)[tile.icon] || LucideIcons.Square

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-2 bg-background border rounded-md shadow-sm w-16 h-16 cursor-grab",
        isDragging && "opacity-50",
      )}
    >
      <IconComponent className="h-6 w-6 mb-1 text-primary" />
      <span className="text-xs font-medium truncate w-full text-center">{tile.title}</span>
    </div>
  )
}

