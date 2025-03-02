"use client"

import { useState, useCallback, useEffect } from "react"
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable"
import { restrictToWindowEdges } from "@dnd-kit/modifiers"
import { Button } from "@/components/ui/button"
import { Plus, Undo2, Redo2, LayoutGrid, Eye, EyeOff } from "lucide-react"
import { SortableColumn } from "@/components/sortable-column"
import { SortableRow } from "@/components/sortable-row"
import { TileGrid } from "@/components/tile-grid"
import { TileList } from "@/components/tile-list"
import { Tile } from "@/components/tile"
import { PreviewMode } from "@/components/preview-mode"
import { v4 as uuidv4 } from "uuid"
import { z } from "zod"

// -------------------------
// Zod Schema Definitions
// -------------------------
const TileTypeSchema = z.object({
  id: z.string(),
  title: z.string(),
  icon: z.string(),
})

const ColumnTypeSchema = z.object({
  id: z.string(),
  title: z.string(),
})

const RowTypeSchema = z.object({
  id: z.string(),
  title: z.string(),
})

const CellContentTypeSchema = z.object({
  columnId: z.string(),
  rowId: z.string(),
  tiles: z.array(TileTypeSchema),
})

const StateSchema = z.object({
  columns: z.array(ColumnTypeSchema).optional(),
  rows: z.array(RowTypeSchema).optional(),
  cellContents: z.array(CellContentTypeSchema).optional(),
  //availableTiles: z.array(TileTypeSchema).optional(),
})

// -------------------------
// Component Props
// -------------------------
export type TileOrganizerProps = {
  initialData?: string // JSON string representing the state
  onStateChange?: (state: string) => void
}

export type TileType = {
  id: string
  title: string
  icon: string
}

export type ColumnType = {
  id: string
  title: string
}

export type RowType = {
  id: string
  title: string
}

export type CellContentType = {
  columnId: string
  rowId: string
  tiles: TileType[]
}

export type HistoryState = {
  columns: ColumnType[]
  rows: RowType[]
  cellContents: CellContentType[]
}

export default function TileOrganizer({ initialData, onStateChange }: TileOrganizerProps) {
  // -------------------------
  // State variables
  // -------------------------
  // Start with empty arrays for columns, rows, and cellContents.
  const [columns, setColumns] = useState<ColumnType[]>([])
  const [rows, setRows] = useState<RowType[]>([])
  const [cellContents, setCellContents] = useState<CellContentType[]>([])

  // Available tiles are pre-populated
  const [availableTiles, setAvailableTiles] = useState<TileType[]>([
    { id: "tile1", title: "Reports", icon: "file-text" },
    { id: "tile2", title: "Analytics", icon: "bar-chart" },
    { id: "tile3", title: "Users", icon: "users" },
    { id: "tile4", title: "Settings", icon: "settings" },
    { id: "tile5", title: "Calendar", icon: "calendar" },
    { id: "tile6", title: "Messages", icon: "message-square" },
    { id: "tile7", title: "Tasks", icon: "check-square" },
    { id: "tile8", title: "Notifications", icon: "bell" },
  ])

  // Error state for initialData parsing
  const [error, setError] = useState<string | null>(null)

  // Active drag state
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeItem, setActiveItem] = useState<any | null>(null)
  const [dragType, setDragType] = useState<"column" | "row" | "tile" | null>(null)

  const [history, setHistory] = useState<HistoryState[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  // ---------------------------------
  // Parse initialData with Zod
  // ---------------------------------
  useEffect(() => {
    debugger
    if (initialData) {
      try {
        const parsed = JSON.parse(initialData)
        const validated = StateSchema.parse(parsed)
        setColumns(validated.columns ?? [])
        setRows(validated.rows ?? [])
        setCellContents(validated.cellContents ?? [])
        // if (validated.availableTiles) {
        //   setAvailableTiles(validated.availableTiles)
        // }
        setError(null)
      } catch (err: any) {
        setError("Error parsing initial data: " + err.message)
      }
    }
  }, [initialData])

  // ---------------------------------
  // Call onStateChange callback when state updates
  // ---------------------------------
  useEffect(() => {
    if (onStateChange) {
      const currentState = JSON.stringify({ columns, rows, cellContents })
      onStateChange(currentState)
    }
  }, [columns, rows, cellContents, availableTiles, onStateChange])

  // Toggle preview mode
  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode)
  }

  // Function to add a new state to the history
  const addToHistory = useCallback(
    (newState: HistoryState) => {
      setHistory((prevHistory) => {
        const newHistory = [...prevHistory.slice(0, historyIndex + 1), newState]
        return newHistory.slice(-50) // Keep only the last 50 states
      })
      setHistoryIndex((prevIndex) => Math.min(prevIndex + 1, 49))
    },
    [historyIndex],
  )

  // Undo function
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prevIndex) => prevIndex - 1)
      const prevState = history[historyIndex - 1]
      setColumns(prevState.columns)
      setRows(prevState.rows)
      setCellContents(prevState.cellContents)
    }
  }, [history, historyIndex])

  // Redo function
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prevIndex) => prevIndex + 1)
      const nextState = history[historyIndex + 1]
      setColumns(nextState.columns)
      setRows(nextState.rows)
      setCellContents(nextState.cellContents)
    }
  }, [history, historyIndex])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault()
        undo()
      } else if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault()
        redo()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [undo, redo])

  // Function to update column title
  const updateColumnTitle = (id: string, newTitle: string) => {
    setColumns((prevColumns) => {
      const newColumns = prevColumns.map((col) => (col.id === id ? { ...col, title: newTitle } : col))
      addToHistory({ columns: newColumns, rows, cellContents })
      return newColumns
    })
  }

  // Function to update row title
  const updateRowTitle = (id: string, newTitle: string) => {
    setRows((prevRows) => {
      const newRows = prevRows.map((row) => (row.id === id ? { ...row, title: newTitle } : row))
      addToHistory({ columns, rows: newRows, cellContents })
      return newRows
    })
  }

  // Function to add a new tile
  const addNewTile = () => {
    const newTile: TileType = {
      id: `tile-${uuidv4()}`,
      title: "New Tile",
      icon: "square", // Default icon
    }
    setAvailableTiles((prevTiles) => {
      const newTiles = [...prevTiles, newTile]
      addToHistory({ columns, rows, cellContents }) // availableTiles is not included in history
      return newTiles
    })
  }

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Handle drag start
  const handleDragStart = (event: any) => {
    const { active } = event
    setActiveId(active.id)

    // Determine what type of item is being dragged
    if (active.data.current?.type === "column") {
      setDragType("column")
      setActiveItem(columns.find((col) => col.id === active.id))
    } else if (active.data.current?.type === "row") {
      setDragType("row")
      setActiveItem(rows.find((row) => row.id === active.id))
    } else if (active.data.current?.type === "tile") {
      setDragType("tile")
      const tileSource = active.data.current?.source

      if (tileSource === "available") {
        setActiveItem(availableTiles.find((tile) => tile.id === active.id))
      } else if (tileSource === "cell") {
        const { columnId, rowId } = active.data.current
        const cell = cellContents.find((c) => c.columnId === columnId && c.rowId === rowId)
        setActiveItem(cell?.tiles.find((tile) => tile.id === active.id))
      }
    }
  }

  // Handle drag end
  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (!over) {
      setActiveId(null)
      setActiveItem(null)
      setDragType(null)
      return
    }

    // Handle column reordering
    if (dragType === "column" && active.id !== over.id) {
      setColumns((columns) => {
        const oldIndex = columns.findIndex((col) => col.id === active.id)
        const newIndex = columns.findIndex((col) => col.id === over.id)
        const newColumns = arrayMove(columns, oldIndex, newIndex)
        addToHistory({ columns: newColumns, rows, cellContents })
        return newColumns
      })
    }

    // Handle row reordering
    else if (dragType === "row" && active.id !== over.id) {
      setRows((rows) => {
        const oldIndex = rows.findIndex((row) => row.id === active.id)
        const newIndex = rows.findIndex((row) => row.id === over.id)
        const newRows = arrayMove(rows, oldIndex, newIndex)
        addToHistory({ columns, rows: newRows, cellContents })
        return newRows
      })
    }

    // Handle tile movement
    else if (dragType === "tile") {
      const activeData = active.data.current
      const overData = over.data.current

      // Moving from available tiles to a cell
      if (activeData.source === "available" && overData?.type === "cell") {
        const { columnId, rowId } = overData
        const newTile = { ...availableTiles.find((t) => t.id === active.id)!, id: uuidv4() }

        setCellContents((prev) => {
          const existingCellIndex = prev.findIndex((c) => c.columnId === columnId && c.rowId === rowId)

          if (existingCellIndex >= 0) {
            const updatedContents = [...prev]
            updatedContents[existingCellIndex] = {
              ...updatedContents[existingCellIndex],
              tiles: [...updatedContents[existingCellIndex].tiles, newTile],
            }
            addToHistory({ columns, rows, cellContents: updatedContents })
            return updatedContents
          } else {
            const updatedContents = [...prev, { columnId, rowId, tiles: [newTile] }]
            addToHistory({ columns, rows, cellContents: updatedContents })
            return updatedContents
          }
        })
      }

      // Moving from one cell to another or within the same cell
      else if (activeData.source === "cell" && overData?.type === "cell") {
        const sourceColumnId = activeData.columnId
        const sourceRowId = activeData.rowId
        const targetColumnId = overData.columnId
        const targetRowId = overData.rowId

        setCellContents((prev) => {
          const updatedContents = [...prev]
          const sourceCellIndex = updatedContents.findIndex(
            (c) => c.columnId === sourceColumnId && c.rowId === sourceRowId,
          )

          if (sourceCellIndex < 0) return prev

          const tileToMove = updatedContents[sourceCellIndex].tiles.find((t) => t.id === active.id)
          if (!tileToMove) return prev

          // Remove from source
          updatedContents[sourceCellIndex] = {
            ...updatedContents[sourceCellIndex],
            tiles: updatedContents[sourceCellIndex].tiles.filter((t) => t.id !== active.id),
          }

          // Add to target
          const targetCellIndex = updatedContents.findIndex(
            (c) => c.columnId === targetColumnId && c.rowId === targetRowId,
          )

          if (targetCellIndex >= 0) {
            updatedContents[targetCellIndex] = {
              ...updatedContents[targetCellIndex],
              tiles: [...updatedContents[targetCellIndex].tiles, tileToMove],
            }
          } else {
            updatedContents.push({
              columnId: targetColumnId,
              rowId: targetRowId,
              tiles: [tileToMove],
            })
          }
          addToHistory({ columns, rows, cellContents: updatedContents })
          return updatedContents
        })
      }

      // Reordering tiles within a cell
      else if (
        activeData.source === "cell" &&
        overData?.source === "cell" &&
        activeData.columnId === overData.columnId &&
        activeData.rowId === overData.rowId
      ) {
        setCellContents((prev) => {
          const cellIndex = prev.findIndex((c) => c.columnId === activeData.columnId && c.rowId === activeData.rowId)

          if (cellIndex < 0) return prev

          const oldIndex = prev[cellIndex].tiles.findIndex((t) => t.id === active.id)
          const newIndex = prev[cellIndex].tiles.findIndex((t) => t.id === over.id)

          const updatedContents = [...prev]
          updatedContents[cellIndex] = {
            ...updatedContents[cellIndex],
            tiles: arrayMove(updatedContents[cellIndex].tiles, oldIndex, newIndex),
          }
          addToHistory({ columns, rows, cellContents: updatedContents })
          return updatedContents
        })
      }
    }

    setActiveId(null)
    setActiveItem(null)
    setDragType(null)

    // After all drag operations, add the new state to history
    addToHistory({ columns, rows, cellContents })
  }

  // Add a new column
  const addColumn = () => {
    const newId = `column-${uuidv4()}`
    setColumns((prevColumns) => {
      const newColumns = [...prevColumns, { id: newId, title: `New Column` }]
      addToHistory({ columns: newColumns, rows, cellContents })
      return newColumns
    })
  }

  // Add a new row
  const addRow = () => {
    const newId = `row-${uuidv4()}`
    setRows((prevRows) => {
      const newRows = [...prevRows, { id: newId, title: `New Work Area` }]
      addToHistory({ columns, rows: newRows, cellContents })
      return newRows
    })
  }

  // Remove a column
  const removeColumn = (id: string) => {
    setColumns((prevColumns) => {
      const newColumns = prevColumns.filter((col) => col.id !== id)
      setCellContents((prevCellContents) => {
        const newCellContents = prevCellContents.filter((cell) => cell.columnId !== id)
        addToHistory({ columns: newColumns, rows, cellContents: newCellContents })
        return newCellContents
      })
      return newColumns
    })
  }

  // Remove a row
  const removeRow = (id: string) => {
    setRows((prevRows) => {
      const newRows = prevRows.filter((row) => row.id !== id)
      setCellContents((prevCellContents) => {
        const newCellContents = prevCellContents.filter((cell) => cell.rowId !== id)
        addToHistory({ columns, rows: newRows, cellContents: newCellContents })
        return newCellContents
      })
      return newRows
    })
  }

  // Remove a tile from a cell
  const removeTile = (columnId: string, rowId: string, tileId: string) => {
    setCellContents((prevCellContents) => {
      const newCellContents = prevCellContents
        .map((cell) => {
          if (cell.columnId === columnId && cell.rowId === rowId) {
            return {
              ...cell,
              tiles: cell.tiles.filter((tile) => tile.id !== tileId),
            }
          }
          return cell
        })
        .filter((cell) => cell.tiles.length > 0)
      addToHistory({ columns, rows, cellContents: newCellContents })
      return newCellContents
    })
  }

  return (
    <div className="space-y-4">
      {/* Show error message if initialData failed to parse */}
      {error && (
        <div className="p-2 bg-red-100 border border-red-200 rounded">
          {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-card rounded-lg border shadow-sm p-2 flex items-center space-x-2">
        <Button variant="outline" size="icon" onClick={addNewTile} disabled={isPreviewMode}>
          <LayoutGrid className="h-4 w-4" />
          <span className="sr-only">Add new tile</span>
        </Button>
        <Button variant="outline" size="icon" onClick={undo} disabled={historyIndex <= 0 || isPreviewMode}>
          <Undo2 className="h-4 w-4" />
          <span className="sr-only">Undo</span>
        </Button>
        <Button variant="outline" size="icon" onClick={redo} disabled={historyIndex >= history.length - 1 || isPreviewMode}>
          <Redo2 className="h-4 w-4" />
          <span className="sr-only">Redo</span>
        </Button>
        <Button variant="outline" size="icon" onClick={togglePreviewMode}>
          {isPreviewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span className="sr-only">{isPreviewMode ? "Exit Preview" : "Enter Preview"}</span>
        </Button>
      </div>

      {/* Content */}
      {isPreviewMode ? (
        <PreviewMode columns={columns} rows={rows} cellContents={cellContents} />
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToWindowEdges]}
          >
            <div className="w-full lg:w-3/4 space-y-6">
              <div className="bg-card rounded-lg border shadow-sm p-4">
                {/* Column headers */}
                <div className="flex items-center mb-4">
                  <div className="w-40 flex-shrink-0"></div>
                  <div className="flex-1 overflow-x-auto">
                    <SortableContext items={columns.map((col) => col.id)} strategy={horizontalListSortingStrategy}>
                      <div className="flex min-w-max">
                        {columns.map((column) => (
                          <SortableColumn
                            key={column.id}
                            column={column}
                            onRemove={() => removeColumn(column.id)}
                            onUpdateTitle={updateColumnTitle}
                          />
                        ))}
                        <div className="flex-shrink-0 w-12 flex items-center justify-center">
                          <Button variant="ghost" size="icon" onClick={addColumn} className="h-8 w-8 rounded-full">
                            <Plus className="h-4 w-4" />
                            <span className="sr-only">Add column</span>
                          </Button>
                        </div>
                      </div>
                    </SortableContext>
                  </div>
                </div>

                {/* Grid with rows and cells */}
                <div className="flex flex-col">
                  <SortableContext items={rows.map((row) => row.id)} strategy={verticalListSortingStrategy}>
                    {rows.map((row) => (
                      <div key={row.id} className="flex mb-4">
                        <SortableRow row={row} onRemove={() => removeRow(row.id)} onUpdateTitle={updateRowTitle} />
                        <TileGrid row={row} columns={columns} cellContents={cellContents} onRemoveTile={removeTile} />
                      </div>
                    ))}
                  </SortableContext>

                  <Button variant="outline" className="ml-40 self-start" onClick={addRow}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Work Area
                  </Button>
                </div>
              </div>
            </div>

            {/* Available tiles sidebar */}
            <div className="w-full lg:w-1/4">
              <div className="bg-card rounded-lg border shadow-sm p-4">
                <h2 className="text-lg font-semibold mb-4">Available Tiles</h2>
                <TileList tiles={availableTiles} />
              </div>
            </div>

            {/* Drag overlay */}
            <DragOverlay>
              {activeId && dragType === "column" && activeItem && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 w-40 opacity-80">
                  {activeItem.title}
                </div>
              )}
              {activeId && dragType === "row" && activeItem && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 w-40 opacity-80">
                  {activeItem.title}
                </div>
              )}
              {activeId && dragType === "tile" && activeItem && <Tile tile={activeItem} isDragging={true} />}
            </DragOverlay>
          </DndContext>
        </div>
      )}
    </div>
  )
}
