'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { nanoid } from 'nanoid'
import {
  Undo,
  Redo,
  Plus,
  Edit,
  Eye,
  PlusCircle,
  X,
  Move,
  LucideIcon,
  Mail,
  Settings,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

import {
  TreeNodeComponent,
  useUndoRedo,
  TreeNode,
  EditorData,
  EditorMode
} from './tree-editor-components'

import ActionSelector, { ActionPropertyEditorProps, ActionType, DefaultPropertyEditor } from './action-selector'
import { IconPicker } from './icon-picker'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { useToast } from '@/hooks/use-toast'
import { Checkbox } from './ui/checkbox'
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


// Main TreeEditor component
export const TreeEditor: React.FC<{
  initialData: EditorData
  onChange: (data: EditorData) => void
  className?: string
  actions: ActionType[]
}> = ({ initialData, onChange, className = '', actions }) => {
  const { currentState, updateState, undo, redo, canUndo, canRedo } =
    useUndoRedo(initialData)
  const [mode, setMode] = useState<EditorMode>('view')
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<number[] | null>(null)
  const [dontPromptDelete, setDontPromptDelete] = useState(false)
  const [propertiesPanelOpen, setPropertiesPanelOpen] = useState(false)
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set())
  const [copiedNode, setCopiedNode] = useState<TreeNode | null>(null)
  const { toast } = useToast()

  const pasteItem = useCallback(() => {
    if (copiedNode && selectedItem) {
      const newData = JSON.parse(JSON.stringify(currentState)) as EditorData
      const path = findItemPathById(newData, selectedItem)
      if (path) {
        let currentLevel: TreeNode[] = newData

        for (let i = 0; i < path.length; i++) {
          if (!currentLevel[path[i]].children) {
            currentLevel[path[i]].children = []
          }
          currentLevel = currentLevel[path[i]].children!
        }

        const newNode = JSON.parse(JSON.stringify(copiedNode))
        assignNewIds(newNode)
        currentLevel.push(newNode)

        updateState(newData)
        toast({ title: 'Item pasted' })
      }
    }
  }, [copiedNode, selectedItem, currentState, updateState, toast])

  useEffect(() => {
    onChange(currentState)
  }, [currentState, onChange])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode !== 'view') {
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
          e.preventDefault()
          if (e.shiftKey) {
            redo()
          } else {
            undo()
          }
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
          e.preventDefault()
          redo()
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
          e.preventDefault()
          if (selectedItem) {
            const node = findItemById(currentState, selectedItem)
            if (node) {
              setCopiedNode(JSON.parse(JSON.stringify(node)))
              toast({ title: 'Item copied' })
            }
          }
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
          e.preventDefault()
          if (copiedNode) {
            pasteItem()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [mode, undo, redo, selectedItem, currentState, copiedNode, pasteItem, toast])

  // Helper functions
  const findItemById = (items: TreeNode[], id: string): TreeNode | null => {
    for (let item of items) {
      if (item.id === id) {
        return item
      }
      if (item.children) {
        const found = findItemById(item.children, id)
        if (found) {
          return found
        }
      }
    }
    return null
  }

  const findItemPathById = (
    items: TreeNode[],
    id: string,
    path: number[] = []
  ): number[] | null => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.id === id) {
        return [...path, i]
      }
      if (item.children) {
        const found = findItemPathById(item.children, id, [...path, i])
        if (found) {
          return found
        }
      }
    }
    return null
  }

  const addItem = useCallback(
    (path: number[]) => {
      const newData = JSON.parse(JSON.stringify(currentState)) as EditorData
      let currentLevel: TreeNode[] = newData

      for (let i = 0; i < path.length; i++) {
        if (!currentLevel[path[i]].children) {
          currentLevel[path[i]].children = []
        }
        currentLevel = currentLevel[path[i]].children!
      }

      const newItem: TreeNode = {
        id: nanoid(),
        text: 'New Item',
        icon: 'File',
        children: []
      }
      currentLevel.push(newItem)

      updateState(newData)
    },
    [currentState, updateState]
  )

  const deleteItem = useCallback(
    (path: number[]) => {
      const newData = JSON.parse(JSON.stringify(currentState)) as EditorData
      let currentLevel: TreeNode[] = newData

      for (let i = 0; i < path.length - 1; i++) {
        currentLevel = currentLevel[path[i]].children!
      }

      currentLevel.splice(path[path.length - 1], 1)

      updateState(newData)
      setSelectedItem(null)
      setPropertiesPanelOpen(false)
    },
    [currentState, updateState]
  )

  const handleDeleteItem = useCallback(
    (path: number[]) => {
      if (dontPromptDelete) {
        deleteItem(path)
      } else {
        setItemToDelete(path)
        setDeleteConfirmOpen(true)
      }
    },
    [dontPromptDelete, deleteItem]
  )

  const confirmDelete = useCallback(() => {
    if (itemToDelete) {
      deleteItem(itemToDelete)
      setDeleteConfirmOpen(false)
      setItemToDelete(null)
    }
  }, [itemToDelete, deleteItem])

  const copyItem = useCallback(
    (id: string) => {
      const node = findItemById(currentState, id)
      if (node) {
        setCopiedNode(JSON.parse(JSON.stringify(node)))
        toast({ title: 'Item copied' })
      }
    },
    [currentState, toast]
  )

  const assignNewIds = (node: TreeNode) => {
    node.id = nanoid()
    if (node.children) {
      node.children.forEach(assignNewIds)
    }
  }

  const moveItemUp = useCallback(
    (path: number[]) => {
      if (path.length === 0 || path[path.length - 1] === 0) return
      const newData = JSON.parse(JSON.stringify(currentState)) as EditorData
      let currentLevel: TreeNode[] = newData

      for (let i = 0; i < path.length - 1; i++) {
        currentLevel = currentLevel[path[i]].children!
      }

      const index = path[path.length - 1]
      const temp = currentLevel[index - 1]
      currentLevel[index - 1] = currentLevel[index]
      currentLevel[index] = temp

      updateState(newData)
      setSelectedItem(currentLevel[index - 1].id)
    },
    [currentState, updateState]
  )

  const moveItemDown = useCallback(
    (path: number[]) => {
      const newData = JSON.parse(JSON.stringify(currentState)) as EditorData
      let currentLevel: TreeNode[] = newData

      for (let i = 0; i < path.length - 1; i++) {
        currentLevel = currentLevel[path[i]].children!
      }

      const index = path[path.length - 1]
      if (index >= currentLevel.length - 1) return

      const temp = currentLevel[index + 1]
      currentLevel[index + 1] = currentLevel[index]
      currentLevel[index] = temp

      updateState(newData)
      setSelectedItem(currentLevel[index + 1].id)
    },
    [currentState, updateState]
  )

  const promoteItem = useCallback(
    (path: number[]) => {
      if (path.length < 2) return // Cannot promote root level items
      const newData = JSON.parse(JSON.stringify(currentState)) as EditorData

      let currentLevel: TreeNode[] = newData
      for (let i = 0; i < path.length - 2; i++) {
        currentLevel = currentLevel[path[i]].children!
      }

      const parentIndex = path[path.length - 2]
      const index = path[path.length - 1]
      const itemToPromote = currentLevel[parentIndex].children![index]

      // Remove item from current level
      currentLevel[parentIndex].children!.splice(index, 1)

      // Insert item into parent level after its parent
      currentLevel.splice(parentIndex + 1, 0, itemToPromote)

      updateState(newData)
      setSelectedItem(itemToPromote.id)
    },
    [currentState, updateState]
  )

  const demoteItem = useCallback(
    (path: number[]) => {
      if (path.length < 1 || path[path.length - 1] === 0) return // Cannot demote if no previous sibling
      const newData = JSON.parse(JSON.stringify(currentState)) as EditorData

      let currentLevel: TreeNode[] = newData
      for (let i = 0; i < path.length - 1; i++) {
        currentLevel = currentLevel[path[i]].children!
      }

      const index = path[path.length - 1]
      const prevSibling = currentLevel[index - 1]
      const itemToDemote = currentLevel[index]

      // Remove item from current level
      currentLevel.splice(index, 1)

      // Add item as the last child of previous sibling
      if (!prevSibling.children) {
        prevSibling.children = []
      }
      prevSibling.children.push(itemToDemote)

      updateState(newData)
      setSelectedItem(itemToDemote.id)
    },
    [currentState, updateState]
  )

  const renderItems = useCallback(
    (items: TreeNode[], path: number[] = []) => {
      return items.map((item, index) => {
        const currentPath = [...path, index]
        const isCollapsed = collapsedItems.has(item.id)
        const hasChildren = item.children && item.children.length > 0

        const disableMoveUp = index === 0
        const disableMoveDown = index === items.length - 1
        const disablePromote = path.length === 0 // Root level items cannot be promoted
        const disableDemote = index === 0 // Cannot demote if no previous sibling

        return (
          <React.Fragment key={item.id}>
            <TreeNodeComponent
              node={item}
              depth={currentPath.length - 1}
              mode={mode}
              onAddItem={() => addItem(currentPath)}
              onDeleteItem={() => handleDeleteItem(currentPath)}
              onSelectItem={() => {
                setSelectedItem(item.id)
                setPropertiesPanelOpen(true)
              }}
              onCopyItem={() => copyItem(item.id)}
              onPasteItem={() => {
                setSelectedItem(item.id)
                pasteItem()
              }}
              onMoveUp={() => moveItemUp(currentPath)}
              onMoveDown={() => moveItemDown(currentPath)}
              onPromote={() => promoteItem(currentPath)}
              onDemote={() => demoteItem(currentPath)}
              isSelected={selectedItem === item.id}
              hasChildren={!!hasChildren}
              isCollapsed={isCollapsed}
              onToggleCollapse={() => {
                setCollapsedItems((prev) => {
                  const newSet = new Set(prev)
                  if (newSet.has(item.id)) {
                    newSet.delete(item.id)
                  } else {
                    newSet.add(item.id)
                  }
                  return newSet
                })
              }}
              path={currentPath}
              disableMoveUp={disableMoveUp}
              disableMoveDown={disableMoveDown}
              disablePromote={disablePromote}
              disableDemote={disableDemote}
            />
            {hasChildren && !isCollapsed && (
              <div>{renderItems(item.children!, currentPath)}</div>
            )}
          </React.Fragment>
        )
      })
    },
    [
      mode,
      addItem,
      handleDeleteItem,
      selectedItem,
      collapsedItems,
      copyItem,
      pasteItem,
      moveItemUp,
      moveItemDown,
      promoteItem,
      demoteItem
    ]
  )

  const updateItemProperty = useCallback(
    (property: string, value: string | ActionType) => {
      if (!selectedItem) return

      const newData = JSON.parse(JSON.stringify(currentState)) as EditorData

      const updateItem = (items: TreeNode[]): boolean => {
        for (let item of items) {
          if (item.id === selectedItem) {
            if (property === 'action') {
              item.action = value as ActionType
            } else {
              // @ts-ignore
              item[property] = value
            }
            return true
          }
          if (item.children && updateItem(item.children)) {
            return true
          }
        }
        return false
      }

      updateItem(newData)
      updateState(newData)
    },
    [currentState, updateState, selectedItem]
  )

  const selectedItemData = selectedItem
    ? findItemById(currentState, selectedItem)
    : null

  const handleActionSelect = (action: ActionType) => {
    updateItemProperty('action', action)
  }
  const getPropertyEditor = (actionType: string): React.FC<ActionPropertyEditorProps> => {
    // You can return different property editors based on the action type
    return DefaultPropertyEditor
  }
  const handleUpdateProperties = (actionId: string, updatedProperties: any) => {
    if (!selectedItem) return

    const newData = JSON.parse(JSON.stringify(currentState)) as EditorData

    const updateItem = (items: TreeNode[]): boolean => {
      for (let item of items) {
        if (item.id === selectedItem && item.action && item.action.id === actionId) {
          item.action.properties = updatedProperties
          return true
        }
        if (item.children && updateItem(item.children)) {
          return true
        }
      }
      return false
    }

    updateItem(newData)
    updateState(newData)
  }

  return (
    <Card className={`w-full max-w-5xl mx-auto ${className}`}>
      <CardContent className="p-6">
        <div className="flex justify-between mb-4">
          <Select
            value={mode}
            onValueChange={(value: EditorMode) => setMode(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="view">
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </div>
              </SelectItem>
              <SelectItem value="edit">
                <div className="flex items-center">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </div>
              </SelectItem>
              <SelectItem value="reorder">
                <div className="flex items-center">
                  <Move className="w-4 h-4 mr-2" />

                  Reorder
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          {mode !== 'view' && (
            <div className="space-x-2 flex">
              <Button
                onClick={undo}
                variant={"secondary"}
                disabled={!canUndo}
                size="sm"
              >
                <Undo className="w-4 h-4 mr-2" />

              </Button>
              <Button
                onClick={redo}
                variant={"secondary"}
                disabled={!canRedo}
                size="sm"
              >
                <Redo className="w-4 h-4 mr-2" />

              </Button>
            </div>)}
        </div>
        <div className="flex">
          <div className="flex-grow overflow-auto max-h-[600px]">
            {currentState.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64">
                <p className="mb-4 text-muted-foreground">No items to display.</p>
                {mode !== 'view' && (
                  <Button onClick={() => addItem([])}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Root Item
                  </Button>
                )}
              </div>
            ) : (
              <div>{renderItems(currentState)}</div>
            )}
            {/* {mode === 'edit' && currentState.length === 0 && (
              <Button onClick={() => addItem([])} className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Add Root Item
              </Button>
            )} */}
          </div>
          {propertiesPanelOpen && selectedItemData && (
            <Card className="w-64 ml-4 p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Properties</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPropertiesPanelOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="itemName">Name</Label>
                  <Input
                    id="itemName"
                    value={selectedItemData.text}
                    onChange={(e) =>
                      updateItemProperty('text', e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="itemIcon">Icon</Label>
                  <IconPicker mode={mode === "edit" ? "edit" : "view"} value={selectedItemData.icon} onIconChange={(value) => updateItemProperty('icon', value)} />

                </div>
                <div>
                  <Label htmlFor="itemAction">Action</Label>
                  <ActionSelector
                    actions={actions}
                    onActionSelect={handleActionSelect}
                    onUpdateProperties={handleUpdateProperties}
                    getActionIcon={getActionIcon}
                    getPropertyEditor={getPropertyEditor} mode={'view'}
                  />
                </div>
              </div>
            </Card>
          )}
        </div>
      </CardContent>
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dontPrompt"
                checked={dontPromptDelete}
                onCheckedChange={(checked) =>
                  setDontPromptDelete(checked as boolean)
                }
              />
              <label
                htmlFor="dontPrompt"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Don&apos;t ask again this session
              </label>
            </div>
          </DialogFooter>
          <DialogFooter>
            <Button type="submit" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

// Example data

const exampleData: EditorData = [
  {
    id: nanoid(),
    text: 'Our Group',
    icon: 'Folder',
    children: [
      {
        id: nanoid(),
        text: 'About us',
        icon: 'File',
        children: [
          {
            id: nanoid(),
            text: 'Strategic positioning, ambition & purpose',
            icon: 'FileText',
            children: []
          },
          {
            id: nanoid(),
            text: 'Facts & Figures',
            icon: 'FileText',
            children: []
          },
          {
            id: nanoid(),
            text: 'Values & Behaviours',
            icon: 'FileText',
            children: []
          }
        ]
      },
      {
        id: nanoid(),
        text: 'New@Nexi: Onboarding Guides',
        icon: 'File',
        children: []
      }
    ]
  },
  {
    id: nanoid(),
    text: 'Our Organisation',
    icon: 'Folder',
    children: [
      {
        id: nanoid(),
        text: 'Brand Identity',
        icon: 'File',
        children: [
          {
            id: nanoid(),
            text: 'Logos & Rules',
            icon: 'FileText',
            children: []
          },
          {
            id: nanoid(),
            text: 'Web & Social Media',
            icon: 'FileText',
            children: []
          },
          {
            id: nanoid(),
            text: 'Brand materials & templates',
            icon: 'FileText',
            children: []
          }
        ]
      },
      {
        id: nanoid(),
        text: 'DEI',
        icon: 'File',
        children: []
      },
      {
        id: nanoid(),
        text: 'ESG',
        icon: 'File',
        children: []
      }
    ]
  },
  {
    id: nanoid(),
    text: 'Countries',
    icon: 'Folder',
    children: [
      {
        id: nanoid(),
        text: 'DACH',
        icon: 'File',
        children: []
      }
    ]
  }
]



// Export the component
export default function TreeView() {
  // Example actions (you should replace these with your actual actions)
  const exampleActions: ActionType[] = [
    {
      id: 'action1',

      title: 'Action 1',
      description: 'This is action 1',
      actionType: 'type1',
      properties: {},

    },
    {
      id: 'action2',

      title: 'Action 2',
      description: 'This is action 2',
      actionType: 'type2',
      properties: {},

    }
  ]

  return (

    <TreeEditor
      initialData={exampleData}
      onChange={(data) => console.log('Structure updated:', data)}
      actions={exampleActions}
    />
  )
}