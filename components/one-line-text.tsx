"use client"

import React, { useState, useEffect } from 'react'
import { ComponentDoc } from './component-documentation-hub'

/**
 * OneLineText Component
 * 
 * This component provides a simple one-line text input with support for view, new, and edit modes.
 * It uses TypeScript for type safety and Tailwind CSS for styling.
 * 
 * @param {Object} props - The component props
 * @param {string} props.initialValue - The initial value of the text input
 * @param {string} props.placeholder - Placeholder text for the input field
 * @param {'view' | 'new' | 'edit'} props.mode - The current mode of the component
 * @param {(mode: string, value: string) => void} props.onChange - Callback function for value changes
 * @param {string} [props.className] - Additional CSS classes to apply to the component
 */
interface OneLineTextProps {
  initialValue: string
  placeholder: string
  mode: 'view' | 'new' | 'edit'
  onChange: (mode: string, value: string) => void
  className?: string
}

export default function OneLineTextComponent({
  initialValue,
  placeholder,
  mode,
  onChange,
  className = ''
}: OneLineTextProps) {
  const [value, setValue] = useState(initialValue)

  // Update local state if prop changes
  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    onChange(mode, newValue)
  }

  // Render based on mode
  const renderContent = () => {
    switch (mode) {
      case 'view':
        return <p className="py-2">{value || placeholder}</p>
      case 'new':
      case 'edit':
        return (
          <input
            type="text"
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )
    }
  }

  return (
    <div className={`one-line-text ${className}`}>
      {renderContent()}
    </div>
  )
}

// Example usage documentation
export const examplesOneLineText: ComponentDoc[] = [
  {
    id: 'OneLineTextView',
    name: 'OneLineText - View Mode',
    description: 'OneLineText component in view mode',
    usage: `
<OneLineText
  initialValue="Hello, World!"
  placeholder="Enter text"
  mode="view"
  onChange={(mode, value) => console.log(mode, value)}
/>
    `,
    example: (
      <OneLineTextComponent
        initialValue="Hello, World!"
        placeholder="Enter text"
        mode="view"
        onChange={(mode, value) => console.log(mode, value)}
      />
    ),
  },
  {
    id: 'OneLineTextEdit',
    name: 'OneLineText - Edit Mode',
    description: 'OneLineText component in edit mode',
    usage: `
<OneLineText
  initialValue="Edit me"
  placeholder="Enter text"
  mode="edit"
  onChange={(mode, value) => console.log(mode, value)}
/>
    `,
    example: (
      <OneLineTextComponent
        initialValue="Edit me"
        placeholder="Enter text"
        mode="edit"
        onChange={(mode, value) => console.log(mode, value)}
      />
    ),
  },
  {
    id: 'OneLineTextNew',
    name: 'OneLineText - New Mode',
    description: 'OneLineText component in new mode',
    usage: `
<OneLineText
  initialValue=""
  placeholder="Enter new text"
  mode="new"
  onChange={(mode, value) => console.log(mode, value)}
/>
    `,
    example: (
      <OneLineTextComponent
        initialValue=""
        placeholder="Enter new text"
        mode="new"
        onChange={(mode, value) => console.log(mode, value)}
      />
    ),
  },
]