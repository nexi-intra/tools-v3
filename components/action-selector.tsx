'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { ChevronDown, MoreVertical, Search, Mail, Settings, User, LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ComponentDoc } from './component-documentation-hub'
import { z } from 'zod'
import { ZeroTrust } from '@/components/zero-trust'

// Define Zod schemas for type safety
const ActionPropertyDataSchema = z.record(z.any())

const ActionTypeSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  actionType: z.string(),
  properties: ActionPropertyDataSchema,
})

const ActionPropertyEditorPropsSchema = z.object({
  mode: z.enum(['view', 'edit', 'new']),
  hideProperties: z.boolean(),
  properties: ActionPropertyDataSchema,
  onUpdateProperties: z.function().args(ActionPropertyDataSchema).returns(z.void()),
})

const ActionSelectorPropsSchema = z.object({
  actions: z.array(ActionTypeSchema),
  onActionSelect: z.function().args(ActionTypeSchema).returns(z.void()),
  onUpdateProperties: z.function().args(z.string(), ActionPropertyDataSchema).returns(z.void()),
  getActionIcon: z.function().args(z.string()).returns(z.any()),
  getPropertyEditor: z.function().args(z.string()).returns(z.any()),
  className: z.string().optional(),
  defaultAction: ActionTypeSchema.optional(),
  mode: z.enum(['view', 'edit', 'new']),
})

// Infer TypeScript types from Zod schemas
type ActionPropertyData = z.infer<typeof ActionPropertyDataSchema>
export type ActionType = z.infer<typeof ActionTypeSchema>
export type ActionPropertyEditorProps = z.infer<typeof ActionPropertyEditorPropsSchema>
type ActionSelectorProps = z.infer<typeof ActionSelectorPropsSchema>

// DefaultPropertyEditor component
export const DefaultPropertyEditor: React.FC<ActionPropertyEditorProps> = ({
  mode,
  hideProperties,
  properties,
  onUpdateProperties,
}) => {
  if (hideProperties) return null

  return (
    <div className="space-y-4">
      {Object.entries(properties).map(([key, value]) => (
        <div key={key} className="flex items-center space-x-2">
          <label htmlFor={key} className="w-1/3 text-sm font-medium">{key}:</label>
          {mode === 'view' ? (
            <span className="w-2/3">{String(value)}</span>
          ) : (
            <Input
              id={key}
              value={String(value)}
              onChange={(e) => onUpdateProperties({ ...properties, [key]: e.target.value })}
              className="w-2/3"
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ActionSelector component
export default function ActionSelector({
  actions,
  onActionSelect,
  onUpdateProperties,
  getActionIcon,
  getPropertyEditor,
  className = '',
  defaultAction,
  mode,
}: ActionSelectorProps) {
  const [selectedAction, setSelectedAction] = useState<ActionType | undefined>(defaultAction)
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const handleActionSelect = useCallback((action: ActionType) => {
    setSelectedAction(action)
    onActionSelect(action)
    setIsOpen(false)
  }, [onActionSelect])

  const handleUpdateProperties = useCallback((updatedProperties: ActionPropertyData) => {
    if (selectedAction) {
      onUpdateProperties(selectedAction.id, updatedProperties)
    }
  }, [selectedAction, onUpdateProperties])

  const filteredActions = useMemo(() => {
    return actions.filter(action => {
      return action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.description.toLowerCase().includes(searchTerm.toLowerCase())
    })
  }, [actions, searchTerm])

  return (
    <>
      <ZeroTrust
        schema={ActionSelectorPropsSchema}
        props={{ actions, onActionSelect, onUpdateProperties, getActionIcon, getPropertyEditor, className, defaultAction, mode }}
        actionLevel="error"
        componentName="ActionSelector"
      />
      <div className={`flex flex-col ${className}`}>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isOpen}
              className="w-full justify-between"
            >
              <div className="flex items-center">
                {selectedAction ? (
                  <>
                    {React.createElement(getActionIcon(selectedAction.actionType), { className: "h-4 w-4", "aria-hidden": "true" })}
                    <span className="ml-2">{selectedAction.title}</span>
                  </>
                ) : (
                  <span>Select an action</span>
                )}
              </div>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <div className="p-2 space-y-2">
              <Input
                type="search"
                placeholder="Search actions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
              <div className="max-h-[300px] overflow-y-auto">
                {filteredActions.map((action) => (
                  <Card
                    key={action.id}
                    className="mb-2 cursor-pointer hover:bg-accent"
                    onClick={() => handleActionSelect(action)}
                  >
                    <CardHeader className="flex flex-row items-center space-y-0 p-3">
                      {React.createElement(getActionIcon(action.actionType), { className: "h-4 w-4", "aria-hidden": "true" })}
                      <CardTitle className="ml-2 text-sm font-medium">{action.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <CardDescription className="text-xs">{action.description}</CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {selectedAction && (
          <div className="mt-4 p-4 border rounded-md relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{selectedAction.title}</h3>
              <div>
                {mode !== 'view' && (
                  <Button variant="outline" size="sm" onClick={() => onActionSelect(selectedAction)} className="mr-2">
                    {mode === 'edit' ? 'Save' : 'Create'}
                  </Button>
                )}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">View all properties</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{selectedAction.title} - All Properties</DialogTitle>
                    </DialogHeader>
                    {React.createElement(getPropertyEditor(selectedAction.actionType), {
                      mode: "view",
                      hideProperties: false,
                      properties: selectedAction.properties,
                      onUpdateProperties: handleUpdateProperties
                    })}
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            {React.createElement(getPropertyEditor(selectedAction.actionType), {
              mode,
              hideProperties: false,
              properties: selectedAction.properties,
              onUpdateProperties: handleUpdateProperties
            })}
          </div>
        )}
      </div>
    </>
  )
}

// Example usage and documentation
export const examplesActionSelector: ComponentDoc[] = [
  {
    id: 'ActionSelector',
    name: 'ActionSelector',
    description: 'A component for selecting an action from a list with search capabilities and property editing.',
    usage: `
import ActionSelector from './ActionSelector'
import { Mail, Settings, User, LucideIcon } from 'lucide-react'

const actions: ActionType[] = [
  {
    id: '1',
    title: 'Send Email',
    description: 'Compose and send an email',
    actionType: 'send_email',
    properties: {
      recipient: '',
      subject: '',
      body: ''
    }
  },
  // ... (include more actions here)
]

const getActionIcon = (actionType: string): LucideIcon => {
  switch (actionType) {
    case 'send_email':
      return Mail
    case 'update_settings':
      return Settings
    case 'edit_profile':
      return User
    default:
      return Mail
  }
}

const getPropertyEditor = (actionType: string): React.FC<ActionPropertyEditorProps> => {
  // You can return different property editors based on the action type
  return DefaultPropertyEditor
}

const handleActionSelect = (action: ActionType) => {
  console.log('Selected action:', action)
}

const handleUpdateProperties = (actionId: string, updatedProperties: ActionPropertyData) => {
  console.log('Updated properties for action', actionId, ':', updatedProperties)
}

<ActionSelector
  actions={actions}
  onActionSelect={handleActionSelect}
  onUpdateProperties={handleUpdateProperties}
  getActionIcon={getActionIcon}
  getPropertyEditor={getPropertyEditor}
  className="w-full max-w-md"
  mode="view"
/>
    `,
    example: (
      <ActionSelector
        actions={[
          {
            id: '1',
            title: 'Send Email',
            description: 'Compose and send an email',
            actionType: 'send_email',
            properties: {
              recipient: '',
              subject: '',
              body: ''
            }
          },
          {
            id: '2',
            title: 'Update Settings',
            description: 'Modify application settings',
            actionType: 'update_settings',
            properties: {
              theme: 'light',
              notifications: true
            }
          }
        ]}
        onActionSelect={(action) => console.log('Selected action:', action)}
        onUpdateProperties={(actionId, updatedProperties) => console.log('Updated properties for action', actionId, ':', updatedProperties)}
        getActionIcon={(actionType) => actionType === 'send_email' ? Mail : Settings}
        getPropertyEditor={() => DefaultPropertyEditor}
        className="w-full max-w-md"
        mode="view"
      />
    ),
  }
]