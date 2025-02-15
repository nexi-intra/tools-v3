import React, { useState, useEffect } from "react"
import { z } from "zod"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Toggle } from "@/components/ui/toggle"
import { CalendarDays, Heart, Play, AlertCircle, CheckCircle2, Pin, Edit } from 'lucide-react'
import { ZeroTrust } from '@/components/zero-trust'
import { ComponentDoc } from './component-documentation-hub'
import { DragDropEditor, GridSchema } from "./dnd"

/**
 * ActionCard Component
 * 
 * This component displays detailed information about an action, including its creator,
 * associated contacts, statistics, and tools used. It supports view, new, and edit modes,
 * and provides callbacks for changes in data or mode.
 * 
 * Key Features:
 * - Displays action details including title, description, creator, and associated contacts
 * - Shows statistics like likes, launches, and failures
 * - Supports pinning the action
 * - Displays tools used in the action
 * - Provides a launch button for the action
 * - Supports view, new, and edit modes with appropriate UI changes
 * - Uses Zod for runtime type checking of props
 * 
 * Usage:
 * <ActionCard
 *   mode="view"
 *   initialData={...}
 *   onUpdate={(mode, data) => {...}}
 *   className="custom-class"
 * />
 */

const ContactSchema = z.object({
  name: z.string(),
  avatar: z.string().url(),
})

const ToolSchema = z.object({
  icon: z.custom<React.ReactNode>(),
  name: z.string(),
})

const ActionCardSchema = z.object({
  children: z.any().optional(),
  mode: z.enum(["view", "new", "edit"]),
  initialData: z.object({
    creator: ContactSchema,
    otherContacts: z.array(ContactSchema).optional(),
    lastReviewed: z.date(),
    likes: z.number().int().nonnegative(),
    launches: z.number().int().nonnegative(),
    openFailures: z.number().int().nonnegative(),
    closedFailures: z.number().int().nonnegative(),
    tools: z.array(ToolSchema),
    title: z.string(),
    description: z.string(),
    hashtag: z.string(),
    isPinned: z.boolean(),
    grid: GridSchema.optional(),
  }),
  onUpdate: z.function(
    z.tuple([
      z.enum(["view", "new", "edit"]),
      z.any()
    ]),
    z.void()
  ),
  className: z.string().optional(),
})

type ActionCardProps = z.infer<typeof ActionCardSchema>

export function ActionCard({
  mode,
  initialData,
  onUpdate,
  className = "",
  children
}: ActionCardProps) {
  const [data, setData] = useState(initialData)

  useEffect(() => {
    setData(initialData)
  }, [initialData])

  const handleUpdate = (newData: Partial<typeof data>) => {
    const updatedData = { ...data, ...newData }
    setData(updatedData)
    onUpdate(mode, updatedData)
  }

  const isEditable = mode === "edit" || mode === "new"

  return (
    <>
      <ZeroTrust
        schema={ActionCardSchema}
        props={{ mode, initialData, onUpdate, className }}
        actionLevel="error"
        componentName="ActionCard"
      />
      <TooltipProvider>
        <Card className={`w-full max-w-2xl ${className}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={data.creator.avatar} alt={data.creator.name} />
                  <AvatarFallback>{data.creator.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  {isEditable ? (
                    <input
                      type="text"
                      value={data.title}
                      onChange={(e) => handleUpdate({ title: e.target.value })}
                      className="text-xl font-bold bg-transparent border-none focus:outline-none"
                    />
                  ) : (
                    <h2 className="text-xl font-bold">{data.title}</h2>
                  )}
                  <p className="text-sm text-muted-foreground">Created by {data.creator.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {isEditable ? (
                  <input
                    type="text"
                    value={data.hashtag}
                    onChange={(e) => handleUpdate({ hashtag: e.target.value })}
                    className="text-xs bg-transparent border-none focus:outline-none"
                  />
                ) : (
                  <Badge variant="secondary" className="text-xs">#{data.hashtag}</Badge>
                )}
                <Toggle
                  aria-label="Toggle pin"
                  pressed={data.isPinned}
                  onPressedChange={(isPinned) => handleUpdate({ isPinned })}
                >
                  <Pin className={`h-4 w-4 ${data.isPinned ? 'text-primary' : 'text-muted-foreground'}`} />
                </Toggle>
                {data.otherContacts && data.otherContacts.map((contact, index) => (
                  <Tooltip key={index}>
                    <TooltipTrigger>
                      <Avatar>
                        <AvatarImage src={contact.avatar} alt={contact.name} />
                        <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{contact.name}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isEditable ? (
              <textarea
                value={data.description}
                onChange={(e) => handleUpdate({ description: e.target.value })}
                className="w-full mb-4 text-muted-foreground bg-transparent border-none focus:outline-none"
              />
            ) : (
              <p className="mb-4 text-muted-foreground">{data.description}</p>
            )}

            <DragDropEditor isEditMode={isEditable}
              value={data.grid || { columns: [], rows: [] }}
              onSave={(data) => handleUpdate({ grid: data })} />
            {/* <div className="flex flex-wrap gap-2 mb-4">
              {data.tools.map((tool, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tool.icon}
                  {tool.name}
                </Badge>
              ))}
            </div> */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center">
                <CalendarDays className="mr-1 h-4 w-4" />
                Last reviewed: {data.lastReviewed.toLocaleDateString()}
              </div>
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <Heart className="mr-1 h-4 w-4" /> {data.likes}
                </span>
                <span className="flex items-center">
                  <Play className="mr-1 h-4 w-4" /> {data.launches}
                </span>
                <span className="flex items-center">
                  <AlertCircle className="mr-1 h-4 w-4" /> {data.openFailures}
                </span>
                <span className="flex items-center">
                  <CheckCircle2 className="mr-1 h-4 w-4" /> {data.closedFailures}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => onUpdate(mode, data)}>
              {mode === "view" ? "Launch Action" : mode === "new" ? "Create Action" : "Update Action"}
            </Button>
          </CardFooter>
        </Card>
      </TooltipProvider>
    </>
  )
}

export const examplesActionCard: ComponentDoc[] = [
  {
    id: 'ActionCardView',
    name: 'ActionCard (View Mode)',
    description: 'Displays an action card in view mode.',
    usage: `
<ActionCard
  mode="view"
  initialData={{
    creator: { name: "John Doe", avatar: "https://example.com/avatar.jpg" },
    otherContacts: [{ name: "Jane Smith", avatar: "https://example.com/avatar2.jpg" }],
    lastReviewed: new Date(),
    likes: 42,
    launches: 100,
    openFailures: 2,
    closedFailures: 5,
    tools: [{ icon: <HeartIcon />, name: "Love" }],
    title: "Sample Action",
    description: "This is a sample action description.",
    hashtag: "sample",
    isPinned: false
  }}
  onUpdate={(mode, data) => console.log(mode, data)}
/>
    `,
    example: (
      <ActionCard
        mode="view"
        initialData={{
          creator: { name: "John Doe", avatar: "https://example.com/avatar.jpg" },
          otherContacts: [{ name: "Jane Smith", avatar: "https://example.com/avatar2.jpg" }],
          lastReviewed: new Date(),
          likes: 42,
          launches: 100,
          openFailures: 2,
          closedFailures: 5,
          tools: [{ icon: <Heart />, name: "Love" }],
          title: "Sample Action",
          description: "This is a sample action description.",
          hashtag: "sample",
          isPinned: false,
          grid: { columns: [], rows: [] }
        }}
        onUpdate={(mode, data) => console.log(mode, data)}
      />
    ),
  },
  {
    id: 'ActionCardEdit',
    name: 'ActionCard (Edit Mode)',
    description: 'Displays an action card in edit mode.',
    usage: `
<ActionCard
  mode="edit"
  initialData={{
    creator: { name: "John Doe", avatar: "https://example.com/avatar.jpg" },
    otherContacts: [{ name: "Jane Smith", avatar: "https://example.com/avatar2.jpg" }],
    lastReviewed: new Date(),
    likes: 42,
    launches: 100,
    openFailures: 2,
    closedFailures: 5,
    tools: [{ icon: <HeartIcon />, name: "Love" }],
    title: "Sample Action",
    description: "This is a sample action description.",
    hashtag: "sample",
    isPinned: false
  }}
  onUpdate={(mode, data) => console.log(mode, data)}
/>
    `,
    example: (
      <ActionCard
        mode="edit"
        initialData={{
          creator: { name: "John Doe", avatar: "https://example.com/avatar.jpg" },
          otherContacts: [{ name: "Jane Smith", avatar: "https://example.com/avatar2.jpg" }],
          lastReviewed: new Date(),
          likes: 42,
          launches: 100,
          openFailures: 2,
          closedFailures: 5,
          tools: [{ icon: <Heart />, name: "Love" }],
          title: "Sample Action",
          description: "This is a sample action description.",
          hashtag: "sample",
          isPinned: false,
          grid: {
            columns: [
              { id: "1", title: "Column 1" },
              { id: "2", title: "Column 2" },
              { id: "3", title: "Column 3" },
            ],
            rows: [
              {
                id: "1",
                cells: [
                  {
                    id: "1", components: [{
                      id: "1", content: "Row 1, Column 1",
                      type: "box"
                    }]
                  },
                  {
                    id: "2", components: [{
                      id: "2", content: "Row 1, Column 2",
                      type: "box"
                    }]
                  },
                  {
                    id: "3", components: [{
                      id: "3", content: "Row 1, Column 3",
                      type: "box"
                    }]
                  },
                ],
              },

            ],
          },
        }}
        onUpdate={(mode, data) => console.log(mode, data)}
      />
    ),
  },
]

