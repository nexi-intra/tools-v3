'use client'

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { File, Trash2, Plus, ExternalLink } from 'lucide-react';

// Define the structure for a file link
interface FileLink {
  id: string;
  name: string;
  url: string;
  type: string;
}

// Define the props for the FileLinksGrid component
interface FileLinksGridProps {
  initialLinks: FileLink[];
  mode: 'view' | 'edit' | 'new';
  columns: number;
  className?: string;
  onUpdate: (mode: 'view' | 'edit' | 'new', links: FileLink[]) => void;
}

/**
 * FileLinksGrid Component
 * 
 * This component displays a grid of file links with icons, names, and URLs.
 * It supports view, edit, and new modes, allows for adding, changing, and deleting rows,
 * and includes drag-and-drop functionality for reordering in edit and new modes.
 */
export function FileLinksGridComponent({ initialLinks, mode, columns, className = '', onUpdate }: FileLinksGridProps) {
  const [links, setLinks] = useState<FileLink[]>(initialLinks);

  useEffect(() => {
    setLinks(initialLinks);
  }, [initialLinks]);

  // Handle changes to a file link
  const handleChange = (id: string, field: keyof FileLink, value: string) => {
    const updatedLinks = links.map(link =>
      link.id === id ? { ...link, [field]: value } : link
    );
    setLinks(updatedLinks);
    onUpdate(mode, updatedLinks);
  };

  // Add a new file link
  const addLink = () => {
    const newLink: FileLink = { id: Date.now().toString(), name: '', url: '', type: 'file' };
    setLinks([...links, newLink]);
    onUpdate(mode, [...links, newLink]);
  };

  // Remove a file link
  const removeLink = (id: string) => {
    const updatedLinks = links.filter(link => link.id !== id);
    setLinks(updatedLinks);
    onUpdate(mode, updatedLinks);
  };

  // Handle drag and drop reordering
  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(links);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setLinks(items);
    onUpdate(mode, items);
  };

  // Render a file link based on the current mode
  const renderFileLink = (link: FileLink, index: number) => {
    const isEditMode = mode === 'edit' || mode === 'new';

    return (
      <Draggable key={link.id} draggableId={link.id} index={index} isDragDisabled={!isEditMode}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="flex items-center p-2 border rounded mb-2"
          >
            <File className="mr-2" />
            {isEditMode ? (
              <>
                <input
                  type="text"
                  value={link.name}
                  onChange={(e) => handleChange(link.id, 'name', e.target.value)}
                  className="flex-grow mr-2 p-1 border rounded"
                  placeholder="File name"
                />
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => handleChange(link.id, 'url', e.target.value)}
                  className="flex-grow mr-2 p-1 border rounded"
                  placeholder="URL"
                />
                <button onClick={() => removeLink(link.id)} className="text-red-500">
                  <Trash2 size={18} />
                </button>
              </>
            ) : (
              <>

                <a href={link.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-blue-500">
                  <span className="flex-grow">{link.name}</span>
                  <ExternalLink size={18} />
                </a>
              </>
            )}
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <div className={`${className} p-4`}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="fileLinks">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`grid gap-4 ${columns === 1 ? '' : `grid-cols-${columns}`}`}
            >
              {links.map((link, index) => renderFileLink(link, index))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      {(mode === 'edit' || mode === 'new') && (
        <button onClick={addLink} className="mt-4 p-2 bg-blue-500 text-white rounded flex items-center">
          <Plus size={18} className="mr-2" /> Add File Link
        </button>
      )}
    </div>
  );
}

// Example usage documentation
import { ComponentDoc } from './component-documentation-hub';

export const examplesFileLinksGrid: ComponentDoc[] = [
  {
    id: 'FileLinksGridView',
    name: 'FileLinksGrid (View Mode)',
    description: 'A component for displaying file links in a grid format.',
    usage: `
      <FileLinksGrid
        initialLinks={[
          { id: '1', name: 'Document 1', url: 'https://example.com/doc1', type: 'pdf' },
          { id: '2', name: 'Image 1', url: 'https://example.com/img1', type: 'image' },
        ]}
        mode="view"
        columns={2}
        onUpdate={(mode, links) => console.log(mode, links)}
      />
    `,
    example: (
      <FileLinksGridComponent
        initialLinks={[
          { id: '1', name: 'Document 1', url: 'https://example.com/doc1', type: 'pdf' },
          { id: '2', name: 'Image 1', url: 'https://example.com/img1', type: 'image' },
        ]}
        mode="view"
        columns={2}
        onUpdate={(mode, links) => console.log(mode, links)}
      />
    ),
  },
  {
    id: 'FileLinksGridEdit',
    name: 'FileLinksGrid (Edit Mode)',
    description: 'A component for editing file links in a grid format.',
    usage: `
      <FileLinksGrid
        initialLinks={[
          { id: '1', name: 'Document 1', url: 'https://example.com/doc1', type: 'pdf' },
          { id: '2', name: 'Image 1', url: 'https://example.com/img1', type: 'image' },
        ]}
        mode="edit"
        columns={1}
        onUpdate={(mode, links) => console.log(mode, links)}
      />
    `,
    example: (
      <FileLinksGridComponent
        initialLinks={[
          { id: '1', name: 'Document 1', url: 'https://example.com/doc1', type: 'pdf' },
          { id: '2', name: 'Image 1', url: 'https://example.com/img1', type: 'image' },
        ]}
        mode="edit"
        columns={1}
        onUpdate={(mode, links) => console.log(mode, links)}
      />
    ),
  },
  {
    id: 'FileLinksGridNew',
    name: 'FileLinksGrid (New Mode)',
    description: 'A component for creating new file links in a grid format.',
    usage: `
      <FileLinksGrid
        initialLinks={[]}
        mode="new"
        columns={1}
        onUpdate={(mode, links) => console.log(mode, links)}
      />
    `,
    example: (
      <FileLinksGridComponent
        initialLinks={[]}
        mode="new"
        columns={1}
        onUpdate={(mode, links) => console.log(mode, links)}
      />
    ),
  },
];