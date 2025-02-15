"use client"

import React, { useState, useEffect, useRef, KeyboardEvent } from 'react'
import * as LucidIcons from 'lucide-react'
import { Icon, LucidIconName } from './icon' // Assuming the Icon component is in the same directory
import { ChevronDown } from 'lucide-react'

interface IconPickerProps {
  mode: 'view' | 'new' | 'edit'
  value?: LucidIconName
  className?: string
  onIconChange?: (iconName: LucidIconName) => void
}

export const IconPicker: React.FC<IconPickerProps> = ({
  mode,
  value,
  className = '',
  onIconChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIcon, setSelectedIcon] = useState<LucidIconName | undefined>(value)
  const [filteredIcons, setFilteredIcons] = useState<LucidIconName[]>([])
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [isOpen, setIsOpen] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)

  // Filter icons based on search term and limit to 100
  useEffect(() => {
    const icons = Object.keys(LucidIcons) as LucidIconName[]
    const filtered = icons
      .filter((icon) => icon.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 100) // Limit to 100 icons
    setFilteredIcons(filtered)
    setFocusedIndex(-1)
  }, [searchTerm])

  // Update selected icon when value prop changes
  useEffect(() => {
    setSelectedIcon(value)
  }, [value])

  const handleIconSelect = (iconName: LucidIconName) => {
    setSelectedIcon(iconName)
    onIconChange?.(iconName)
    setIsOpen(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex((prev) => (prev < filteredIcons.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev))
        break
      case 'Enter':
        if (focusedIndex >= 0 && focusedIndex < filteredIcons.length) {
          handleIconSelect(filteredIcons[focusedIndex])
        }
        break
    }
  }

  // Scroll focused item into view
  useEffect(() => {
    if (focusedIndex >= 0 && gridRef.current) {
      const focusedElement = gridRef.current.children[focusedIndex] as HTMLElement
      if (focusedElement) {
        focusedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }, [focusedIndex])

  const toggleDropdown = () => {
    if (mode !== 'view') {
      setIsOpen(!isOpen)
    }
  }

  return (
    <div className={`icon-picker ${className}`}>
      <div
        className={`flex items-center justify-between p-2 border rounded cursor-pointer ${mode !== 'view' ? 'hover:bg-gray-100' : ''
          }`}
        onClick={toggleDropdown}
      >
        <div className="flex items-center gap-2">
          {selectedIcon && <Icon iconName={selectedIcon} className="w-4 h-4" />}
          <span>{selectedIcon || 'Select an icon'}</span>
        </div>
        {mode !== 'view' && <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
      </div>
      {mode !== 'view' && isOpen && (
        <div className="mt-2">
          <input
            type="text"
            placeholder="Search icons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-2 mb-4 border rounded"
            aria-label="Search icons"
          />
          <div
            ref={gridRef}
            className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto"
            role="listbox"
            aria-label="Icon list"
          >
            {filteredIcons.length > 0 ? (
              filteredIcons.map((iconName, index) => (
                <button
                  key={iconName}
                  onClick={() => handleIconSelect(iconName)}
                  className={`flex flex-col items-center p-2 border rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${selectedIcon === iconName ? 'bg-blue-100' : ''
                    } ${focusedIndex === index ? 'ring-2 ring-blue-500' : ''}`}
                  role="option"
                  aria-selected={selectedIcon === iconName}
                  tabIndex={focusedIndex === index ? 0 : -1}
                >
                  <Icon iconName={iconName} className="w-6 h-6 mb-1" />
                  <span className="text-xs truncate w-full text-center">{iconName}</span>
                </button>
              ))
            ) : (
              <div className="col-span-4 text-center text-gray-500">No icons found</div>
            )}
          </div>
          {filteredIcons.length === 100 && (
            <div className="text-xs text-gray-500 mt-2">
              Showing first 100 results. Refine your search for more specific icons.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Example usage documentation
import { ComponentDoc } from './component-documentation-hub'

export const examplesIconPicker: ComponentDoc[] = [
  {
    id: 'IconPicker',
    name: 'IconPicker',
    description: 'A component for selecting Lucide icons with a dropdown interface, search functionality, keyboard navigation, and a limit of 100 displayed icons.',
    usage: `
import { useState } from 'react'
import { IconPicker } from './icon-picker'
import { LucidIconName } from './icon'

const MyComponent = () => {
  const [selectedIcon, setSelectedIcon] = useState<LucidIconName>('Home')

  return (
    <IconPicker
      mode="edit"
      value={selectedIcon}
      onIconChange={(iconName) => setSelectedIcon(iconName)}
    />
  )
}
    `,
    example: (
      <IconPicker
        mode="edit"
        value="Home"
        onIconChange={(iconName) => console.log('Selected icon:', iconName)}
      />
    ),
  },
]