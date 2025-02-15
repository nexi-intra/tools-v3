import React from 'react'
import * as LucidIcons from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'

// Import the ActionType from the actions-selector file
import { ActionType } from './action-selector'
import { Icon, LucidIconName } from './icon'



// Updated TreeNode type
export type TreeNode = {
  id: string
  text: string
  translations?: { [key: string]: string }
  icon: LucidIconName
  children?: TreeNode[]
  action?: ActionType
}

export type EditorData = TreeNode[]

export type EditorMode = 'view' | 'edit' | 'reorder'


// TreeNodeComponent
export const TreeNodeComponent: React.FC<{
  node: TreeNode
  depth: number
  mode: EditorMode
  onAddItem: () => void
  onDeleteItem: () => void
  onSelectItem: () => void
  onCopyItem: () => void
  onPasteItem: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onPromote: () => void
  onDemote: () => void
  isSelected: boolean
  hasChildren: boolean
  isCollapsed: boolean
  onToggleCollapse: () => void
  path: number[]
  disableMoveUp: boolean
  disableMoveDown: boolean
  disablePromote: boolean
  disableDemote: boolean
}> = ({
  node,
  depth,
  mode,
  onAddItem,
  onDeleteItem,
  onSelectItem,
  onCopyItem,
  onPasteItem,
  onMoveUp,
  onMoveDown,
  onPromote,
  onDemote,
  isSelected,
  hasChildren,
  isCollapsed,
  onToggleCollapse,
  path,
  disableMoveUp,
  disableMoveDown,
  disablePromote,
  disableDemote
}) => {
    const { toast } = useToast()

    const handleAction = (action: string) => {
      toast({ title: `${action} action performed` })
    }

    return (
      <div
        className={`relative group flex items-center p-2 mb-1 rounded-md ${mode === 'edit' ? 'hover:bg-accent' : ''
          } ${isSelected ? 'bg-accent' : ''}`}
        style={{
          paddingLeft: `${depth * 20 + 24}px`
        }}
        onDoubleClick={() => mode === 'view' && onToggleCollapse()}
        onClick={onSelectItem}
      >
        <div
          className="absolute left-0"
          style={{
            width: '24px',
            height: '24px',
            left: `${depth * 20}px`
          }}
        >
          {hasChildren ? (
            <Button
              variant="ghost"
              size="icon"
              className="p-0 h-6 w-6"
              onClick={(e) => {
                e.stopPropagation()
                onToggleCollapse()
              }}
            >
              <LucidIcons.ChevronRight
                className={`w-4 h-4 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'
                  }`}
              />
            </Button>
          ) : (
            <div className="w-6 h-6" />
          )}
        </div>
        <Icon iconName={node.icon} className='size-5 mr-2' />
        <span className="flex-grow">{node.text}</span>
        {mode !== 'view' && (
          <div
            className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute right-2
        bg-white dark:bg-gray-800 p-1 rounded-md shadow-md"
          >
            {mode === 'edit' &&
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        onAddItem()
                        handleAction('Add')
                      }}
                    >
                      <LucidIcons.Plus className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add Item</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteItem()
                        handleAction('Delete')
                      }}
                    >
                      <LucidIcons.Trash2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete Item</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        onCopyItem()
                        handleAction('Copy')
                      }}
                    >
                      <LucidIcons.ClipboardCopy className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy Item</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        onPasteItem()
                        handleAction('Paste')
                      }}
                    >
                      <LucidIcons.ClipboardPaste className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Paste Item</TooltipContent>
                </Tooltip>
              </>
            }
            {mode === 'reorder' &&
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        onPromote()
                        handleAction('Promote')
                      }}
                      disabled={disablePromote}
                    >
                      <LucidIcons.ArrowLeft className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Promote</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDemote()
                        handleAction('Demote')
                      }}
                      disabled={disableDemote}
                    >
                      <LucidIcons.ArrowRight className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Demote</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        onMoveUp()
                        handleAction('Move Up')
                      }}
                      disabled={disableMoveUp}
                    >
                      <LucidIcons.ArrowUp className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Move Up</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        onMoveDown()
                        handleAction('Move Down')
                      }}
                      disabled={disableMoveDown}
                    >
                      <LucidIcons.ArrowDown className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Move Down</TooltipContent>
                </Tooltip>
              </>
            }
            {mode === 'edit' &&
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectItem()
                      handleAction('Properties')
                    }}
                  >
                    <LucidIcons.MoreHorizontal className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Properties</TooltipContent>
              </Tooltip>}
          </div>
        )}
      </div>
    )
  }

// Custom hook for undo/redo functionality
export const useUndoRedo = (initialState: EditorData) => {
  const [currentState, setCurrentState] = React.useState(initialState)
  const [pastStates, setPastStates] = React.useState<EditorData[]>([])
  const [futureStates, setFutureStates] = React.useState<EditorData[]>([])

  const canUndo = pastStates.length > 0
  const canRedo = futureStates.length > 0

  const undo = React.useCallback(() => {
    if (canUndo) {
      const previous = pastStates[pastStates.length - 1]
      const newPast = pastStates.slice(0, pastStates.length - 1)
      setPastStates(newPast)
      setFutureStates([currentState, ...futureStates])
      setCurrentState(previous)
    }
  }, [canUndo, currentState, pastStates, futureStates])

  const redo = React.useCallback(() => {
    if (canRedo) {
      const next = futureStates[0]
      const newFuture = futureStates.slice(1)
      setFutureStates(newFuture)
      setPastStates([...pastStates, currentState])
      setCurrentState(next)
    }
  }, [canRedo, currentState, pastStates, futureStates])

  const updateState = React.useCallback(
    (newState: EditorData) => {
      setPastStates([...pastStates, currentState])
      setCurrentState(newState)
      setFutureStates([])
    },
    [currentState, pastStates]
  )

  return { currentState, updateState, undo, redo, canUndo, canRedo }
}

export default TreeNodeComponent