"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable"
import { SortableTile } from "@/components/sortable-tile"
import type { ColumnType, RowType, CellContentType } from "@/components/tile-organizer"

interface TileGridProps {
  row: RowType
  columns: ColumnType[]
  cellContents: CellContentType[]
  onRemoveTile: (columnId: string, rowId: string, tileId: string) => void
}

export function TileGrid({ row, columns, cellContents, onRemoveTile }: TileGridProps) {
  return (
    <div className="flex-1 flex min-w-max">
      {columns.map((column) => {
        // Find tiles for this cell
        const cell = cellContents.find((c) => c.columnId === column.id && c.rowId === row.id)
        const tiles = cell?.tiles || []

        return (
          <Cell
            key={`${column.id}-${row.id}`}
            columnId={column.id}
            rowId={row.id}
            tiles={tiles}
            onRemoveTile={onRemoveTile}
          />
        )
      })}
    </div>
  )
}

interface CellProps {
  columnId: string
  rowId: string
  tiles: any[]
  onRemoveTile: (columnId: string, rowId: string, tileId: string) => void
}

function Cell({ columnId, rowId, tiles, onRemoveTile }: CellProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `cell-${columnId}-${rowId}`,
    data: {
      type: "cell",
      columnId,
      rowId,
    },
  })

  return (
    <div
      ref={setNodeRef}
      className={`w-40 min-h-[100px] p-2 border-dashed border rounded-md flex-shrink-0 transition-colors ${
        isOver ? "bg-primary/5 border-primary/30" : "border-border/50"
      }`}
    >
      {tiles.length > 0 ? (
        <SortableContext items={tiles.map((t) => t.id)} strategy={horizontalListSortingStrategy}>
          <div className="flex flex-wrap gap-2">
            {tiles.map((tile) => (
              <SortableTile
                key={tile.id}
                tile={tile}
                columnId={columnId}
                rowId={rowId}
                onRemove={() => onRemoveTile(columnId, rowId, tile.id)}
              />
            ))}
          </div>
        </SortableContext>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
          Drop tiles here
        </div>
      )}
    </div>
  )
}

