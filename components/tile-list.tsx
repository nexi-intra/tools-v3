"use client"

import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { Tile } from "@/components/tile"
import type { TileType } from "@/components/tile-organizer"

interface TileListProps {
  tiles: TileType[]
}

export function TileList({ tiles }: TileListProps) {
  return (
    <div className="grid grid-cols-2 gap-3 overflow-scroll h-full max-h-[400px] border-2">
      {tiles.map((tile) => (
        <DraggableTile key={tile.id} tile={tile} />
      ))}
    </div>
  )
}

interface DraggableTileProps {
  tile: TileType
}

function DraggableTile({ tile }: DraggableTileProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: tile.id,
    data: {
      type: "tile",
      source: "available",
      tile,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab">
      <Tile tile={tile} isDragging={isDragging} />
    </div>
  )
}

