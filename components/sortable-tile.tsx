"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tile } from "@/components/tile"
import type { TileType } from "@/components/tile-organizer"

interface SortableTileProps {
  tile: TileType
  columnId: string
  rowId: string
  onRemove: () => void
}

export function SortableTile({ tile, columnId, rowId, onRemove }: SortableTileProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tile.id,
    data: {
      type: "tile",
      source: "cell",
      columnId,
      rowId,
      tile,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative group">
      <Tile tile={tile} isDragging={isDragging} />
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-background border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-3 w-3" />
        <span className="sr-only">Remove tile</span>
      </Button>
    </div>
  )
}

