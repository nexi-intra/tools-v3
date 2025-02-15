import React, { useReducer } from 'react';
import { z } from 'zod';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';

import { GripVertical, GripHorizontal, Trash2 } from 'lucide-react';
import OneLineText from './one-line-text';
import IconUploader from './icon-uploader';
import { ToolCardMiniComponent } from './tool-card-mini';
import { Tool } from '@/schemas/forms/tool';


// -------------------------------------------
// Zod Schemas and Types
// -------------------------------------------

const tool: Tool = {
  id: 1,
  // createdAt: new Date(),
  // createdBy: 'John Doe',
  // updatedAt: new Date(),
  // updatedBy: 'Jane Smith',
  // deletedAt: null,
  // deletedBy: null,
  name: 'Sample Tool',
  description: 'This is a sample tool for demonstration purposes. It has a longer description to show how text truncation works in the preview card.',
  url: 'https://example.com/sample-tool',
  created_at: new Date(),
  created_by: '',
  updated_at: new Date(),
  updated_by: '',
  deleted_at: null,
  status: 'deprecated',
  groupId: '',
  purposes: [],
  category: {
    id: 0,
    value: '',
    order: '',
    color: ''
  },
  tags: [],
  version: ''
}
export const ComponentTypeSchema = z.enum(['box', 'tower', 'tool-small', 'tool-medium', 'tool-large']);

export const ComponentSchema = z.object({
  id: z.string(),
  content: z.string(),
  type: ComponentTypeSchema,
});
export type ComponentItem = z.infer<typeof ComponentSchema>;

export const CellSchema = z.object({
  id: z.string(),
  components: z.array(ComponentSchema),
});
export type Cell = z.infer<typeof CellSchema>;

export const ColumnSchema = z.object({
  id: z.string(),
  title: z.string(),
});
export type Column = z.infer<typeof ColumnSchema>;

export const RowSchema = z.object({
  id: z.string(),
  cells: z.array(CellSchema),
});
export type Row = z.infer<typeof RowSchema>;

export const GridSchema = z.object({
  columns: z.array(ColumnSchema),
  rows: z.array(RowSchema),
});
export type Grid = z.infer<typeof GridSchema>;

// -------------------------------------------
// Actions
// -------------------------------------------
const MoveColumnActionSchema = z.object({
  type: z.literal('MOVE_COLUMN'),
  source: z.number(),
  destination: z.number(),
});

const MoveRowActionSchema = z.object({
  type: z.literal('MOVE_ROW'),
  source: z.number(),
  destination: z.number(),
});

const MoveComponentActionSchema = z.object({
  type: z.literal('MOVE_COMPONENT'),
  sourceRow: z.number(),
  sourceColumn: z.number(),
  sourceIndex: z.number(),
  destinationRow: z.number(),
  destinationColumn: z.number(),
  destinationIndex: z.number(),
});

const InsertComponentActionSchema = z.object({
  type: z.literal('INSERT_COMPONENT'),
  rowIndex: z.number(),
  columnIndex: z.number(),
  componentIndex: z.number(),
  component: ComponentSchema,
});

const DeleteComponentActionSchema = z.object({
  type: z.literal('DELETE_COMPONENT'),
  rowIndex: z.number(),
  columnIndex: z.number(),
  componentIndex: z.number(),
});

const InsertRowActionSchema = z.object({
  type: z.literal('INSERT_ROW'),
  index: z.number(),
});

const DeleteRowActionSchema = z.object({
  type: z.literal('DELETE_ROW'),
  index: z.number(),
});

const InsertColumnActionSchema = z.object({
  type: z.literal('INSERT_COLUMN'),
  index: z.number(),
});
const UpdateColumnActionSchema = z.object({
  type: z.literal('UPDATE_COLUMN'),
  title: z.string(),
  index: z.number(),
});

const DeleteColumnActionSchema = z.object({
  type: z.literal('DELETE_COLUMN'),
  index: z.number(),
});

const UndoActionSchema = z.object({
  type: z.literal('UNDO'),
});

const RedoActionSchema = z.object({
  type: z.literal('REDO'),
});

export const EditorActionSchema = z.union([
  MoveColumnActionSchema,
  MoveRowActionSchema,
  MoveComponentActionSchema,
  InsertComponentActionSchema,
  DeleteComponentActionSchema,
  InsertRowActionSchema,
  DeleteRowActionSchema,
  InsertColumnActionSchema,
  UpdateColumnActionSchema,
  DeleteColumnActionSchema,
  UndoActionSchema,
  RedoActionSchema,
]);

export type EditorAction = z.infer<typeof EditorActionSchema>;

export const EditorStateSchema = z.object({
  grid: GridSchema,
  history: z.array(GridSchema),
  future: z.array(GridSchema),
});
export type EditorState = z.infer<typeof EditorStateSchema>;

// -------------------------------------------
// Initial Data
// -------------------------------------------
const initialColumns: Column[] = Array.from({ length: 3 }, (_, colIndex) => ({
  id: `column-${colIndex}`,
  title: `Column ${colIndex + 1}`,
}));

const initialRows: Row[] = Array.from({ length: 3 }, (_, rowIndex) => ({
  id: `row-${rowIndex}`,
  cells: initialColumns.map((_, colIndex) => ({
    id: `cell-${rowIndex}-${colIndex}`,
    components: Array.from({ length: 2 }, (_, compIndex) => ({
      id: `comp-${rowIndex}-${colIndex}-${compIndex}`,
      content: `Comp ${rowIndex + 1}-${colIndex + 1}-${compIndex + 1}`,
      type: 'box'
    })),
  })),
}));

const initialGrid: Grid = {
  columns: initialColumns,
  rows: initialRows,
};

const initialState: EditorState = {
  grid: initialGrid,
  history: [],
  future: [],
};

// A palette of components that can be dragged into the grid
const paletteComponents: ComponentItem[] = [
  { id: 'palette-comp-1', content: 'Palette Tower', type: "tower" },

  { id: 'palette-comp-3', content: 'Palette Box 3', type: "box" },
  { id: 'palette-comp-4', content: 's', type: "tool-small" },
];

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  const pushToHistory = (): EditorState => ({
    ...state,
    history: [...state.history, state.grid],
    future: [],
  });

  switch (action.type) {
    case 'MOVE_COLUMN': {
      const newState = pushToHistory();
      const { columns, rows } = newState.grid;
      const newColumns = Array.from(columns);
      const [movedColumn] = newColumns.splice(action.source, 1);
      newColumns.splice(action.destination, 0, movedColumn);

      // Adjust each row's cells accordingly
      const newRows = rows.map((row) => {
        const newCells = Array.from(row.cells);
        const [movedCell] = newCells.splice(action.source, 1);
        newCells.splice(action.destination, 0, movedCell);
        return { ...row, cells: newCells };
      });

      return {
        ...newState,
        grid: { ...newState.grid, columns: newColumns, rows: newRows },
      };
    }

    case 'MOVE_ROW': {
      const newState = pushToHistory();
      const { rows } = newState.grid;
      const newRows = Array.from(rows);
      const [movedRow] = newRows.splice(action.source, 1);
      newRows.splice(action.destination, 0, movedRow);
      return {
        ...newState,
        grid: { ...newState.grid, rows: newRows },
      };
    }

    case 'MOVE_COMPONENT': {
      const newState = pushToHistory();
      const { rows } = newState.grid;
      const newRows = Array.from(rows);

      // Remove component from source cell
      const sourceRowCells = Array.from(newRows[action.sourceRow].cells);
      const sourceCellComponents = Array.from(sourceRowCells[action.sourceColumn].components);
      const [movedComponent] = sourceCellComponents.splice(action.sourceIndex, 1);
      sourceRowCells[action.sourceColumn] = {
        ...sourceRowCells[action.sourceColumn],
        components: sourceCellComponents,
      };
      newRows[action.sourceRow] = { ...newRows[action.sourceRow], cells: sourceRowCells };

      // Insert component into destination cell
      const destRowCells = Array.from(newRows[action.destinationRow].cells);
      const destCellComponents = Array.from(destRowCells[action.destinationColumn].components);
      destCellComponents.splice(action.destinationIndex, 0, movedComponent);
      destRowCells[action.destinationColumn] = {
        ...destRowCells[action.destinationColumn],
        components: destCellComponents,
      };
      newRows[action.destinationRow] = { ...newRows[action.destinationRow], cells: destRowCells };

      return {
        ...newState,
        grid: { ...newState.grid, rows: newRows },
      };
    }

    case 'INSERT_COMPONENT': {
      const newState = pushToHistory();
      const { rows } = newState.grid;
      const newRows = Array.from(rows);
      const row = newRows[action.rowIndex];
      const cells = Array.from(row.cells);
      const cell = cells[action.columnIndex];
      const newComponents = Array.from(cell.components);
      // Insert the copied component at the specified index
      newComponents.splice(action.componentIndex, 0, action.component);
      cells[action.columnIndex] = { ...cell, components: newComponents };
      newRows[action.rowIndex] = { ...row, cells };

      return {
        ...newState,
        grid: { ...newState.grid, rows: newRows },
      };
    }

    case 'DELETE_COMPONENT': {
      const newState = pushToHistory();
      const { rows } = newState.grid;
      const newRows = Array.from(rows);
      const row = newRows[action.rowIndex];
      const cells = Array.from(row.cells);
      const cell = cells[action.columnIndex];
      const newComponents = Array.from(cell.components);
      newComponents.splice(action.componentIndex, 1);
      cells[action.columnIndex] = { ...cell, components: newComponents };
      newRows[action.rowIndex] = { ...row, cells };

      return {
        ...newState,
        grid: { ...newState.grid, rows: newRows },
      };
    }

    case 'INSERT_ROW': {
      const newState = pushToHistory();
      const { columns, rows } = newState.grid;
      const newRow: Row = {
        id: `row-${rows.length}`,
        cells: columns.map((col, colIndex) => ({
          id: `cell-${rows.length}-${colIndex}`,
          components: [
            {
              id: `comp-${rows.length}-${colIndex}-0`,
              content: `New Comp`,
              type: "box"
            },
          ],
        })),
      };
      const newRows = Array.from(rows);
      newRows.splice(action.index, 0, newRow);
      return {
        ...newState,
        grid: { ...newState.grid, rows: newRows },
      };
    }

    case 'DELETE_ROW': {
      const newState = pushToHistory();
      const { rows } = newState.grid;
      const newRows = Array.from(rows);
      newRows.splice(action.index, 1);
      return {
        ...newState,
        grid: { ...newState.grid, rows: newRows },
      };
    }

    case 'INSERT_COLUMN': {
      const newState = pushToHistory();
      const { columns, rows } = newState.grid;
      const newColumn: Column = {
        id: `column-${columns.length}`,
        title: `Column ${columns.length + 1}`,
      };

      const newColumns = Array.from(columns);
      newColumns.splice(action.index, 0, newColumn);

      const newRows = rows.map((row, rowIndex) => {
        const newCells = Array.from(row.cells);
        newCells.splice(action.index, 0, {
          id: `cell-${rowIndex}-${newColumns.length - 1}`,
          components: [
            {
              id: `comp-${rowIndex}-${newColumns.length - 1}-0`,
              content: 'New Comp',
              type: "box"
            },
          ],
        });
        return { ...row, cells: newCells };
      });

      return {
        ...newState,
        grid: { ...newState.grid, columns: newColumns, rows: newRows },
      };
    }
    case 'UPDATE_COLUMN': {
      const newState = pushToHistory();
      const { columns } = newState.grid;
      const newColumns = Array.from(columns);
      newColumns[action.index] = { ...newColumns[action.index], title: action.title };
      return {
        ...newState,
        grid: { ...newState.grid, columns: newColumns },
      };
    }

    case 'DELETE_COLUMN': {
      const newState = pushToHistory();
      const { columns, rows } = newState.grid;
      const newColumns = Array.from(columns);
      newColumns.splice(action.index, 1);

      const newRows = rows.map((row) => {
        const newCells = Array.from(row.cells);
        newCells.splice(action.index, 1);
        return { ...row, cells: newCells };
      });

      return {
        ...newState,
        grid: { ...newState.grid, columns: newColumns, rows: newRows },
      };
    }

    case 'UNDO': {
      if (state.history.length === 0) return state;
      const previousGrid = state.history[state.history.length - 1];
      const newHistory = state.history.slice(0, -1);
      return {
        ...state,
        future: [state.grid, ...state.future],
        history: newHistory,
        grid: previousGrid,
      };
    }

    case 'REDO': {
      if (state.future.length === 0) return state;
      const nextGrid = state.future[0];
      const newFuture = state.future.slice(1);
      return {
        ...state,
        history: [...state.history, state.grid],
        future: newFuture,
        grid: nextGrid,
      };
    }

    default:
      return state;
  }
}

const DragDropEditorPropsSchema = z.object({
  isEditMode: z.boolean(),
  value: GridSchema,
  onSave: z.function().args(GridSchema).returns(z.void()),
});

type DragDropEditorProps = z.infer<typeof DragDropEditorPropsSchema>;

function parseRowColumnFromDroppableId(droppableId: string): { rowIndex: number; columnIndex: number } {
  const match = droppableId.match(/^components-row-(\d+)-col-(\d+)$/);
  if (!match) throw new Error(`Invalid droppableId format: ${droppableId}`);
  return { rowIndex: parseInt(match[1], 10), columnIndex: parseInt(match[2], 10) };
}


export function DrawComponent({ component, isEditMode }: { isEditMode: boolean, component: ComponentItem }) {
  switch (component.type) {
    case "tower":
      return (
        <div className="p-4 border rounded bg-yellow-400">
          <IconUploader
            size={24}
            mode={isEditMode ? "edit" : "view"}
            initialIcon="/placeholder.svg?height=24&width=24"
            onUpdate={(mode, value) => console.log(mode, value)}
            className=" "
          />
          {component.content}
        </div>
      );

    case "box":
      return (
        <div className="p-4 border rounded bg-green-400">
          {component.content}
        </div>
      );
    case "tool-small":
      return (
        <ToolCardMiniComponent tool={tool} isFavorite={false} allowedTags={[]} />
      );
    default:
      return (
        <div className="p-4 border rounded bg-white">
          {component.content}
        </div>
      );
  }

}

export function DragDropEditor({ isEditMode, onSave, value }: DragDropEditorProps) {
  const [state, dispatch] = useReducer(editorReducer, initialState);

  const { grid, history, future } = state;
  const canUndo = history.length > 0;
  const canRedo = future.length > 0;

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, type } = result;

    // If we are dragging from the palette to a cell in the grid, we are copying a component.
    if (source.droppableId === 'palette' && type === 'COMPONENT') {
      // The destination must be a cell droppable
      const { rowIndex, columnIndex } = parseRowColumnFromDroppableId(destination.droppableId);
      // Find the dragged component from the palette
      const paletteComp = paletteComponents[source.index];
      // Insert a copy at the destination index
      dispatch({
        type: 'INSERT_COMPONENT',
        rowIndex,
        columnIndex,
        componentIndex: destination.index,
        component: {
          id: `comp-${rowIndex}-${columnIndex}-${Date.now()}`,
          content: paletteComp.content,
          type: paletteComp.type
        },
      });
      return;
    }

    if (type === 'COLUMN') {
      dispatch({
        type: 'MOVE_COLUMN',
        source: source.index,
        destination: destination.index,
      });
    } else if (type === 'ROW') {
      dispatch({
        type: 'MOVE_ROW',
        source: source.index,
        destination: destination.index,
      });
    } else if (type === 'COMPONENT' && source.droppableId !== 'palette') {
      // Normal component reordering or moving between cells
      const sourcePos = parseRowColumnFromDroppableId(source.droppableId);
      const destPos = parseRowColumnFromDroppableId(destination.droppableId);

      dispatch({
        type: 'MOVE_COMPONENT',
        sourceRow: sourcePos.rowIndex,
        sourceColumn: sourcePos.columnIndex,
        sourceIndex: source.index,
        destinationRow: destPos.rowIndex,
        destinationColumn: destPos.columnIndex,
        destinationIndex: destination.index,
      });
    }
  };

  const handleDeleteComponent = (rowIndex: number, columnIndex: number, componentIndex: number) => {
    dispatch({
      type: 'DELETE_COMPONENT',
      rowIndex,
      columnIndex,
      componentIndex,
    });
  };

  const handleInsertRow = () => {
    dispatch({
      type: 'INSERT_ROW',
      index: grid.rows.length,
    });
  };

  const handleDeleteRow = (rowIndex: number) => {
    dispatch({
      type: 'DELETE_ROW',
      index: rowIndex,
    });
  };

  const handleInsertColumn = () => {
    dispatch({
      type: 'INSERT_COLUMN',
      index: grid.columns.length,
    });
  };

  const handleDeleteColumn = (columnIndex: number) => {
    dispatch({
      type: 'DELETE_COLUMN',
      index: columnIndex,
    });
  };

  const undo = () => dispatch({ type: 'UNDO' });
  const redo = () => dispatch({ type: 'REDO' });

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <div>
          {isEditMode && (
            <>
              <Button onClick={undo} disabled={!canUndo} className="mr-2">
                Undo
              </Button>
              <Button onClick={redo} disabled={!canRedo} className="mr-2">
                Redo
              </Button>
              <Button onClick={handleInsertRow} className="mr-2">
                Insert Row
              </Button>
              <Button onClick={handleInsertColumn}>Insert Column</Button>
            </>
          )}
        </div>
        <Button onClick={() => onSave(grid)}>Save</Button>
      </div>

      {/* Palette of Components */}
      {/* Users can drag these into the grid. They won't disappear from the palette. */}

      <DragDropContext onDragEnd={onDragEnd}>
        {isEditMode && (
          <Droppable droppableId="palette" type="COMPONENT" direction="horizontal" isDropDisabled>
            {(provided, snapshot) => (
              <div
                className={`flex mb-4 p-2 ${isEditMode ? "border" : ""} ${snapshot.isDraggingOver ? 'bg-gray-100' : 'bg-white'}`}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {paletteComponents.map((comp, index) => (
                  <Draggable
                    key={comp.id}
                    draggableId={comp.id}
                    index={index}

                    isDragDisabled={!isEditMode}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`p-2 ${isEditMode ? "border" : ""} rounded bg-white flex items-center mr-2 ${snapshot.isDragging ? 'bg-blue-50' : 'bg-white'
                          }`}
                      >
                        <div {...provided.dragHandleProps} className="cursor-move mr-2">
                          <GripHorizontal size={16} />
                        </div>
                        <DrawComponent component={comp} isEditMode={isEditMode} />

                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        )}

        {/* Header Row for Columns */}
        <Droppable droppableId="columns" type="COLUMN" direction="horizontal">
          {(provided, snapshot) => (
            <div
              className={`flex mb-4 border-b pb-2 ${snapshot.isDraggingOver ? 'bg-gray-100' : ''}`}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {grid.columns.map((col, colIndex) => (
                <Draggable
                  key={col.id}
                  draggableId={col.id}
                  index={colIndex}
                  isDragDisabled={!isEditMode}
                >
                  {(provided, snapshot) => (
                    <div
                      className={`flex-1 p-2 border-r last:border-r-0 ${snapshot.isDragging ? 'bg-blue-50' : 'bg-white'
                        }`}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {isEditMode && (
                            <div {...provided.dragHandleProps} className="cursor-move mr-2">
                              <GripHorizontal size={16} />
                            </div>
                          )}

                          <OneLineText
                            initialValue={col.title}
                            placeholder="Enter column title"
                            mode={isEditMode ? "edit" : "view"}
                            onChange={(mode, value) => {
                              dispatch({
                                type: 'UPDATE_COLUMN',
                                title: value,
                                index: colIndex,
                              });
                            }}
                          />


                        </div>
                        {isEditMode && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteColumn(colIndex)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Rows and Cells (no column titles here) */}
        <Droppable droppableId="rows" type="ROW" direction="vertical">
          {(provided, snapshot) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
              {grid.rows.map((row, rowIndex) => (
                <Draggable
                  key={row.id}
                  draggableId={row.id}
                  index={rowIndex}
                  isDragDisabled={!isEditMode}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`${isEditMode ? "border" : ""} p-2 bg-slate-300 ${snapshot.isDragging ? 'bg-blue-50' : 'bg-white'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {isEditMode && (
                            <div {...provided.dragHandleProps} className="cursor-move mr-2">
                              <GripVertical size={16} />
                            </div>
                          )}
                          {isEditMode && (
                            <span className="font-bold">{row.id}</span>
                          )}
                        </div>
                        {isEditMode && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteRow(rowIndex)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>

                      {/* Render cells as flex */}
                      <div className="flex">
                        {grid.columns.map((_, columnIndex) => {
                          const cell = row.cells[columnIndex];
                          return (
                            <Droppable
                              key={cell.id}
                              droppableId={`components-row-${rowIndex}-col-${columnIndex}`}
                              type="COMPONENT"
                              direction="horizontal"
                            >
                              {(provided, snapshot) => (
                                <div
                                  className={`flex-1 ${isEditMode ? "border" : ""} p-2 min-h-[50px] ${snapshot.isDraggingOver ? 'bg-gray-100' : ''
                                    }`}
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                >
                                  <div className="flex gap-2 flex-wrap">
                                    {cell.components.map((comp, compIndex) => (
                                      <Draggable
                                        key={comp.id}
                                        draggableId={comp.id}
                                        index={compIndex}
                                        isDragDisabled={!isEditMode}
                                      >
                                        {(provided, snapshot) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className={`p-2 ${isEditMode ? "border" : ""} rounded ${snapshot.isDragging ? 'bg-blue-50' : 'bg-white'
                                              } flex items-center`}
                                          >
                                            {isEditMode && (
                                              <div {...provided.dragHandleProps} className="cursor-move mr-2">
                                                <GripHorizontal size={16} />
                                              </div>
                                            )}
                                            {isEditMode ? (
                                              <DrawComponent isEditMode={isEditMode} component={comp} />
                                            ) : (
                                              <div className="flex-grow"> <DrawComponent isEditMode={isEditMode} component={comp} /></div>
                                            )}
                                            {isEditMode && (
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteComponent(rowIndex, columnIndex, compIndex)}
                                                className="ml-2"
                                              >
                                                <Trash2 size={16} />
                                              </Button>
                                            )}
                                          </div>
                                        )}
                                      </Draggable>
                                    ))}
                                    {provided.placeholder}
                                  </div>
                                </div>
                              )}
                            </Droppable>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

    </div>
  );
}
