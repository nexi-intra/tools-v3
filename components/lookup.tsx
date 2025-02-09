'use client';

import React, { useState, useEffect, useRef, JSX } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X, Plus, ChevronDown, Search } from 'lucide-react';
import clsx from 'clsx';

import { kError, kVerbose } from '@/lib/koksmat-logger-client';

import { CodeViewer } from './code-viewer';
import { isEqual } from '@/lib/isequal';

// Define the IdValue interface
export interface IdValue {
  id: number;
  value: string;
  sortorder: string; // Sorting will be done based on this field
}

// Define the ComponentDoc interface
export interface ComponentDoc {
  id: string;
  name: string;
  description: string;
  usage: string;
  example: JSX.Element;
}

type LazyLoad = {
  lazyLoad?: true;
  loadItems: () => Promise<IdValue[]>; // Function to load items
} | {
  lazyLoad?: false;
  loadItems?: never;
};
// Component Props
type LookupProps = {
  items: IdValue[]; // Available items to select from
  initialSelectedItems?: IdValue[]; // Initially selected items
  allowMulti?: boolean; // Allow multiple selections or not
  required?: boolean; // At least one item should be selected
  mode?: 'view' | 'edit' | 'new'; // Display mode of the component
  canAddNewItems?: boolean; // Can new items be added
  className?: string; // Additional CSS classes
  renderItem?: (item: IdValue, isSelected: boolean) => React.ReactNode; // Optional custom render function for each item
  onChange?: (selectedItems: IdValue[]) => void; // Callback when selected items change
  lazyLoad?: boolean; // Lazy load items
  loadItems?: () => Promise<IdValue[]>; // Function to load items
} & LazyLoad;

const Lookup: React.FC<LookupProps> = ({
  items,
  initialSelectedItems = [],
  allowMulti = true,
  required = false,
  mode = 'edit',
  canAddNewItems = true,
  className = '',
  renderItem,
  onChange,
  lazyLoad,
  loadItems
}) => {
  // State for selected items
  const [selectedItems, setSelectedItems] = useState<IdValue[]>(initialSelectedItems);
  const [selectableItems, setSelectableItems] = useState<IdValue[]>(items);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setisLoaded] = useState(false)
  const prevSelectedItemsRef = useRef(selectedItems);


  // Filtered and sorted items based on search query and sort order
  const filteredItems = selectableItems
    .filter(item => item.value.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.sortorder?.localeCompare(b?.sortorder, undefined, { numeric: true }));


  // Effect to call onChange when selectedItems change
  useEffect(() => {

    if (!isEqual(prevSelectedItemsRef.current, selectedItems)) {
      kVerbose("component", "selectedItems has changed");
      prevSelectedItemsRef.current = selectedItems; // Update the ref
      onChange?.(selectedItems);
    }

  }, [selectedItems, onChange]);

  // Function to toggle item selection
  const toggleItem = (item: IdValue) => {
    if (mode === 'view') return; // Prevent editing in view mode

    if (selectedItems.find(i => i.id === item.id)) {
      // Remove item if it exists
      if (required && selectedItems.length === 0) {
        setError('At least one item must be selected.');
        return;
      }
      setSelectedItems(prev => prev.filter(i => i.id !== item.id));
    } else {
      // Add item if it doesn't exist
      if (!allowMulti) {
        setSelectedItems([item]); // Replace with a single item if allowMulti is false
      } else {
        setSelectedItems(prev => [...prev, item]);
      }
    }
    setError(null);
  };

  // Function to add a new item
  const addNewItem = () => {
    const newItemValue = searchQuery.trim();
    if (newItemValue === '' || items.find(item => item.value === newItemValue)) return;

    const newItem: IdValue = {
      id: -(selectableItems.length + 1), // Generate a unique ID
      value: newItemValue,
      sortorder: (items.length + 1).toString(), // Default sort order for new items
    };

    // Update items list and select the new item
    items.push(newItem);
    setSelectableItems([...selectableItems, newItem]);
    setSelectedItems(prev => [...prev, newItem]);
    setSearchQuery('');
  };

  // Helper to render an item, with support for a custom renderer and a clickable overlay
  const renderDefaultItem = (item: IdValue, isSelected: boolean) => (
    <div
      key={item.id}
      className="relative flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer"
      onClick={() => toggleItem(item)}
    >
      <div>{item.value}</div>
      {mode === 'edit' && isSelected && <X size={16} className="text-red-500" />}

    </div>
  );

  // Function to render an item with an overlay for clicking
  // Function to render an item with an overlay for clicking
  const renderItemWithOverlay = (item: IdValue, isSelected: boolean) => (
    <div key={item.id} className="relative">
      {/* Render the custom item */}
      {renderItem ? renderItem(item, isSelected) : renderDefaultItem(item, isSelected)}

      {/* Overlay to capture clicks only when custom renderItem is provided */}
      {renderItem && mode !== 'view' && (
        <div
          className="absolute inset-0 cursor-pointer"
          onClick={() => toggleItem(item)}
          style={{ backgroundColor: 'transparent' }}
        />
      )}
    </div>
  );

  const handleLazyLoad = async () => {
    if (!lazyLoad) return;
    if (!loadItems) {
      kError('component', 'loadItems function is required for lazy loading');
      return;
    }
    const items = await loadItems();
    setSelectableItems([...items]);
    setisLoaded(true)
  }
  // Determine if the current mode allows editing
  const isEditable = mode === 'edit' || mode === 'new';
  const waitForLoad = lazyLoad && !isLoaded
  return (
    <div className={clsx('w-full', className)}>
      {/* Selected Items Display */}
      <div className="flex items-center gap-2 mb-2">
        {selectedItems.length > 0 ? (
          selectedItems
            .sort((a, b) => a.sortorder?.localeCompare(b?.sortorder, undefined, { numeric: true })) // Sort selected items
            .map(item => renderItemWithOverlay(item, true))
        ) : (
          isEditable && (
            <span className="text-gray-500">
              {allowMulti ? 'Add items' : 'Add item'}
            </span>
          )
        )}

        {/* Edit Button as ChevronDown */}
        {isEditable && (
          <Popover
            open={isPopoverOpen}
            onOpenChange={setIsPopoverOpen}
          >
            <PopoverTrigger asChild>
              <Button variant="ghost" className="flex items-center"
                onClick={handleLazyLoad}>
                <ChevronDown className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4">
              {waitForLoad && <p>Loading...</p>}
              {/* Search Input */}
              {!waitForLoad && (
                <div className="flex items-center mb-2">
                  <Search className="mr-2 h-4 w-4" />
                  <Input
                    placeholder="Search or add new item"
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  {canAddNewItems && (
                    <Button variant="ghost" onClick={addNewItem} disabled={!searchQuery.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>)
              }

              {/* Items List */}
              {!waitForLoad && (
                <div className="max-h-48 overflow-y-auto">
                  {filteredItems.map(item => renderItemWithOverlay(item, selectedItems.some(i => i.id === item.id)))}
                  {filteredItems.length === 0 && (
                    <p className="text-gray-500 text-sm">No items found.</p>
                  )}
                </div>)}
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Error Message if required */}
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};

export default Lookup;
function LookupExample() {
  const [data, setdata] = useState<IdValue[]>([])
  return (
    <div>
      <Lookup
        items={[

        ]}
        mode="edit"
        allowMulti={true}
        required={false}
        initialSelectedItems={[{ id: 2, value: 'Item 2', sortorder: '1' }]}
        onChange={(selectedItems) => {

          setdata(selectedItems)
        }}
        lazyLoad={true}
        loadItems={async () => {
          // wait for 1 second
          await new Promise(resolve => setTimeout(resolve, 1000));
          return [
            { id: 1, value: 'Item 1', sortorder: '3' },
            { id: 2, value: 'Item 2', sortorder: '1' },
            { id: 3, value: 'Item 3', sortorder: '2' },
            { id: 4, value: 'Item 4', sortorder: '4' },
          ]
        }}
      />
      <CodeViewer code={JSON.stringify(data, null, 2)} filename={''} language={'json'} />
    </div>
  );
}
// Example Configurations
export const examplesKeyValueSelector: ComponentDoc[] = [
  {
    id: 'Lookup-SingleSelect-Required-Edit',
    name: 'Lookup (Single Select, Required, Edit Mode)',
    description: 'A component for selecting a single required key-value pair in edit mode using a tagging approach, respecting sort order.',
    usage: `
import Lookup from './Lookup';

const items = [
  { id: 'option1', value: 'Option 1', sortorder: '2' },
  { id: 'option2', value: 'Option 2', sortorder: '1' },
  { id: 'option3', value: 'Option 3', sortorder: '3' },
];

<Lookup
  items={items}
  mode="edit"
  allowMulti={false}
  required={true}
  initialSelectedItems={[{ id: 'option1', value: 'Option 1', sortorder: '2' }]}
  onChange={(selectedItems) => console.log('Selected Items:', selectedItems)}
/>
    `,
    example: (
      <Lookup
        items={[
          { id: 1, value: 'Option 1', sortorder: '2' },
          { id: 2, value: 'Option 2', sortorder: '1' },
          { id: 3, value: 'Option 3', sortorder: '3' },
        ]}
        mode="edit"
        allowMulti={false}
        required={true}
        initialSelectedItems={[{ id: 1, value: 'Option 1', sortorder: '2' }]}
        onChange={(selectedItems) => console.log('Selected Items:', selectedItems)}
      />
    ),
  },
  {
    id: 'Lookup-MultiSelect-Optional-Edit',
    name: 'Lookup (Multi Select, Optional, Edit Mode)',
    description: 'A component for selecting multiple optional key-value pairs in edit mode, with sorting applied by sort order.',
    usage: `
import Lookup from './Lookup';

const items = [
          { id: 1, value: 'Option 1', sortorder: '2' },
          { id: 2, value: 'Option 2', sortorder: '1' },
          { id: 3, value: 'Option 3', sortorder: '3' },

];

<Lookup
  items={items}
  mode="edit"
  allowMulti={true}
  required={false}
  initialSelectedItems={[{ id: 2, value: 'Item 2', sortorder: '1' }]}
  onChange={(selectedItems) => console.log('Selected Items:', selectedItems)}
/>
    `,
    example: (
      <Lookup
        items={[
          { id: 1, value: 'Item 1', sortorder: '3' },
          { id: 2, value: 'Item 2', sortorder: '1' },
          { id: 3, value: 'Item 3', sortorder: '2' },
        ]}
        mode="edit"
        allowMulti={true}
        required={false}
        initialSelectedItems={[{ id: 2, value: 'Item 2', sortorder: '1' }]}
        onChange={(selectedItems) => console.log('Selected Items:', selectedItems)}
      />
    ),
  },
  {
    id: 'Lookup-MultiSelect-Optional-Edit-LazyLoad',
    name: 'Lookup (Multi Select, Optional, Edit Mode,LazyLoad)',
    description: 'A component for selecting multiple optional key-value pairs in edit mode, with sorting applied by sort order.',
    usage: `
import Lookup from './Lookup';

 function LookupExample() {
  const [data, setdata] = useState<IdValue[]>([])
  return (
    <div>
      <Lookup
        items={[

        ]}
        mode="edit"
        allowMulti={true}
        required={false}
        initialSelectedItems={[{ id: 2, value: 'Item 2', sortorder: '1' }]}
        onChange={(selectedItems) => {

          setdata(selectedItems)
        }}
        lazyLoad={true}
        loadItems={async () => {
          // wait for 1 second
          await new Promise(resolve => setTimeout(resolve, 1000));
          return [
            { id: 1, value: 'Item 1', sortorder: '3' },
            { id: 2, value: 'Item 2', sortorder: '1' },
            { id: 3, value: 'Item 3', sortorder: '2' },
            { id: 4, value: 'Item 4', sortorder: '4' },
          ]
        }}
      />
      <CodeViewer code={JSON.stringify(data, null, 2)} filename={''} language={'json'} />
    </div>
  );
}
    `,
    example: (
      <LookupExample
      />
    ),
  },
  {
    id: 'Lookup-SingleSelect-Optional-View',
    name: 'Lookup (Single Select, Optional, View Mode)',
    description: 'A component for displaying a single optional key-value pair in view mode, with sorting by sort order.',
    usage: `
import Lookup from './Lookup';

const items = [
  { id: 1, value: 'View 1', sortorder: '1' },
  { id: 2, value: 'View 2', sortorder: '2' },
];

<Lookup
  items={items}
  mode="view"
  allowMulti={false}
  required={false}
  initialSelectedItems={[{ id: 'view1', value: 'View 1', sortorder: '1' }]}
  onChange={(selectedItems) => console.log('Selected Items:', selectedItems)}
/>
    `,
    example: (
      <Lookup
        items={[
          { id: 1, value: 'View 1', sortorder: '1' },
          { id: 2, value: 'View 2', sortorder: '2' },
        ]}
        mode="view"
        allowMulti={false}
        required={false}
        initialSelectedItems={[{ id: 1, value: 'View 1', sortorder: '1' }]}
        onChange={(selectedItems) => console.log('Selected Items:', selectedItems)}
      />
    ),
  },
];
