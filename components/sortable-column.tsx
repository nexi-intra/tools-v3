"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ColumnType } from "@/components/tile-organizer"

interface SortableColumnProps {
  column: ColumnType
  onRemove: () => void
  onUpdateTitle: (id: string, newTitle: string) => void
}

export function SortableColumn({ column, onRemove, onUpdateTitle }: SortableColumnProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(column.title)
  const inputRef = useRef<HTMLInputElement>(null)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: {
      type: "column",
      column,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleDoubleClick = () => {
    setIsEditing(true)
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (editedTitle.trim() !== "" && editedTitle !== column.title) {
      onUpdateTitle(column.id, editedTitle)
    } else {
      setEditedTitle(column.title)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur()
    } else if (e.key === "Escape") {
      setIsEditing(false)
      setEditedTitle(column.title)
    }
  }

  return (
    <div ref={setNodeRef} style={style} className="flex-shrink-0 w-40 flex flex-col items-center p-2 relative">
      <div className="flex items-center justify-between w-full mb-2">
        <div {...attributes} {...listeners} className="cursor-grab p-1 hover:bg-accent rounded">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        {isEditing ? (
          <Input
            ref={inputRef}
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-24 h-6 text-sm"
          />
        ) : (
          <div onDoubleClick={handleDoubleClick} className="font-medium truncate flex-1 text-center cursor-text">
            {column.title}
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-6 w-6 rounded-full hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="h-3 w-3" />
          <span className="sr-only">Remove column</span>
        </Button>
      </div>
    </div>
  )
}

