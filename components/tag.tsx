'use client'

import * as React from 'react'
import { ComponentDoc } from './component-documentation-hub'
import { Check, ChevronDown, ChevronsUpDown, Plus, Search, X } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useCallback, useEffect, useState } from 'react'
import { Badge } from './ui/badge'
import { Input } from './ui/input'

import { kError } from '@/lib/koksmat-logger-client'


interface TagProps {
  tags?: TagType[]
  selectedTags: string[]
  allowMulti: boolean
  required: boolean
  mode: 'view' | 'new' | 'edit'
  onChange: (mode: 'view' | 'new' | 'edit', selectedTags: string[]) => void
  className?: string
  canEditTagList?: boolean
  onEditTagList?: () => void
}








// Define the Tag interface
export interface TagType {
  id: number;
  value: string
  color: string;
  order: string;
}

type LazyLoad = {
  lazyLoad?: true;
  loadItems: () => Promise<TagType[]>; // Function to load items
} | {
  lazyLoad?: false;
  loadItems?: never;
};
// Component Props
type TagSelectorProps = {
  tags: TagType[]; // Available tags to select from
  initialSelectedTags?: TagType[]; // Initially selected tags
  allowMulti?: boolean; // Allow multiple selections or not
  required?: boolean; // At least one tag should be selected
  mode: 'view' | 'edit' | 'new'; // Display mode of the component
  canAddNewTags?: boolean; // Can new tags be added
  onChange?: (selectedTags: TagType[]) => void; // Callback when selected tags change
} & LazyLoad;

const TagSelector: React.FC<TagSelectorProps> = ({
  tags,
  lazyLoad,
  loadItems,
  initialSelectedTags = [],
  allowMulti = true,
  required = false,
  mode = 'edit',
  canAddNewTags = true,
  onChange,
}) => {
  // State for selected tags

  const [selectedTags, setSelectedTags] = useState<TagType[]>(initialSelectedTags);
  const [selectableTags, setSelectableTags] = useState<TagType[]>(tags);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isLoaded, setisLoaded] = useState(false)
  const waitForLoad = lazyLoad && !isLoaded

  const handleLazyLoad = async () => {
    if (!lazyLoad) return;
    if (!loadItems) {
      kError('component', 'loadItems function is required for lazy loading');
      return;
    }
    const items = await loadItems();
    setSelectableTags([...items]);
    setisLoaded(true)
  }
  // Filtered tags based on search query
  const filteredTags = selectableTags.filter(tag =>
    tag.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Effect to call onChange when selectedTags change
  useEffect(() => {
    onChange?.(selectedTags);
  }, [selectedTags, onChange]);

  // Function to toggle tag selection
  const toggleTag = (tag: TagType) => {
    if (mode === 'view') return; // Prevent editing in view mode

    if (selectedTags.find(t => t.id === tag.id)) {
      // Remove tag if it exists
      if (required && selectedTags.length === 1) {
        setError('At least one tag must be selected.');
        return;
      }
      setSelectedTags(prev => prev.filter(t => t.id !== tag.id));
    } else {
      // Add tag if it doesn't exist
      if (!allowMulti) {
        setSelectedTags([tag]); // Replace with a single tag if allowMulti is false
      } else {
        setSelectedTags(prev => [...prev, tag]);
      }
    }
    setError(null);
  };

  // Function to add a new tag
  const addNewTag = () => {
    const newTagName = searchQuery.trim();
    if (newTagName === '' || selectableTags.find(tag => tag.value === newTagName)) return;

    const newTag: TagType = {
      id: -(selectableTags.length + 1),
      color: '#000000',
      value: newTagName,
      order: newTagName,
    };

    // Update tags list and select the new tag
    selectableTags.push(newTag);
    setSelectedTags(prev => [...prev, newTag]);
    setSearchQuery('');
  };

  return (
    <div className="w-full">
      {/* Selected Tags Display */}
      <div className="flex items-center gap-2 mb-2">
        {selectedTags.length > 0 ? (
          selectedTags.map(tag => (
            <Badge
              key={tag.id}
              style={{ backgroundColor: tag.color }}
              className="flex items-center text-white overflow-ellipsis overflow-clip whitespace-nowrap max-w-40"
            >
              {tag.value}
              {mode === 'edit' && (
                <button
                  onClick={() => toggleTag(tag)}
                  className="ml-1 focus:outline-none"
                  aria-label={`Remove ${tag.id}`}
                >
                  <X size={12} />
                </button>
              )}
            </Badge>
          ))
        ) : (
          mode === 'edit' && (
            <span className="text-gray-500">
              {allowMulti ? 'Add tags' : 'Add tag'}
            </span>
          )
        )}

        {/* Edit Button as ChevronDown */}
        {mode === 'edit' && (
          <Popover
            open={isPopoverOpen}
            onOpenChange={setIsPopoverOpen}
          >
            <PopoverTrigger asChild>
              <Button onClick={handleLazyLoad} variant="ghost" className="flex items-center">
                <ChevronDown className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4">
              {waitForLoad && <p>Loading...</p>}
              {/* Search Input */}
              <div className="flex items-center mb-2">
                <Search className="mr-2 h-4 w-4" />
                <Input
                  placeholder="Search or add new tag"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                {canAddNewTags && (
                  <Button variant="ghost" onClick={addNewTag} disabled={!searchQuery.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Tags List */}
              <div className="max-h-48 overflow-y-auto">
                {filteredTags.map(tag => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span>{tag.value}</span>
                    </div>
                    {selectedTags.find(t => t.id === tag.id) && (
                      <X size={16} className="text-red-500" />
                    )}
                  </div>
                ))}
                {filteredTags.length === 0 && (
                  <p className="text-gray-500 text-sm">No tags found.</p>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Error Message if required */}
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  )
}
export default TagSelector
// Utility function to determine text color based on background color
function getContrastColor(hexColor: string) {
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000
  return (yiq >= 128) ? 'black' : 'white'
}

// Example usage and documentation
export const examplesTag: ComponentDoc[] = [
  {
    id: 'TagDropdown',
    name: 'Tag (Dropdown Style)',
    description: 'Tag component with a dropdown interface for selecting tags.',
    usage: `
      <TagSelector
        tags={[
          { id: 'bug', color: '#d73a4a', value: 'Something isn\'t working', order: '1' },
          { id: 'documentation', color: '#0075ca', value: 'Improvements or additions to documentation', order: '2' },
          { id: 'duplicate', color: '#cfd3d7', value: 'This issue or pull request already exists', order: '3' },
          { id: 'enhancement', color: '#a2eeef', value: 'New feature or request', order: '4' },
          { id: 'good first issue', color: '#7057ff', value: 'Good for newcomers', order: '5' }
        ]}
        initialSelectedTags={[
          { id: 'bug', color: '#d73a4a', value: 'Something isn\'t working', order: '1' },
          { id: 'documentation', color: '#0075ca', value: 'Improvements or additions to documentation', order: '2' }
        ]}
        allowMulti={true}
        required={false}
        mode="edit"
        // onChange={(mode, selectedTags) => console.log(mode, selectedTags)}
        canAddNewTags
        
        // onEditTagList={() => console.log('Edit tag list clicked')}
      />
    `,
    example: (
      <TagSelector
        tags={[
          { id: 1, color: '#d73a4a', value: 'Something isn\'t working', order: '1' },
          { id: 2, color: '#0075ca', value: 'Improvements or additions to documentation', order: '2' },
          { id: 3, color: '#cfd3d7', value: 'This issue or pull request already exists', order: '3' },
          { id: 4, color: '#a2eeef', value: 'New feature or request', order: '4' },
          { id: 5, color: '#7057ff', value: 'Good for newcomers', order: '5' }
        ]}
        initialSelectedTags={[
          { id: 1, color: '#d73a4a', value: 'Something isn\'t working', order: '1' },
          { id: 2, color: '#0075ca', value: 'Improvements or additions to documentation', order: '2' }
        ]}
        allowMulti={true}
        required={false}
        mode="edit"
        // onChange={(mode, selectedTags) => console.log(mode, selectedTags)}
        canAddNewTags

      // onEditTagList={() => console.log('Edit tag list clicked')}
      />
    ),
  },
]