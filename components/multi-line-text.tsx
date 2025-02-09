"use client"

import React, { useState, useEffect } from 'react'
import { ComponentDoc } from './component-documentation-hub'

/**
 * MultiLineText Component
 * 
 * This component renders a multi-line text input field with support for view, new, and edit modes.
 * It manages its own state, accepts initial values via props, and calls a callback function when values change.
 * In view mode, it splits the text at line breaks and renders each block as a separate paragraph.
 * 
 * @param {Object} props - The properties passed to the component
 * @param {string} props.initialValue - The initial value of the text area
 * @param {string} props.mode - The mode of the component: 'view', 'new', or 'edit'
 * @param {function} props.onChange - Callback function called when the value changes
 * @param {string} props.className - Additional CSS classes to apply to the component
 * @param {string} props.placeholder - Placeholder text for the text area
 * @param {number} props.rows - Number of visible text lines
 * @param {number} props.maxLength - Maximum number of characters allowed
 */
export default function MultiLineText({
  initialValue = '',
  mode = 'view',
  onChange,
  className = '',
  placeholder = 'Enter text here...',
  rows = 4,
  maxLength = 1000
}: {
  initialValue?: string
  mode?: 'view' | 'new' | 'edit'
  onChange?: (mode: string, value: string) => void
  className?: string
  placeholder?: string
  rows?: number
  maxLength?: number
}) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    onChange && onChange(mode, newValue)
  }

  const renderViewMode = () => {
    const paragraphs = value ? value.split('\n').filter(paragraph => paragraph.trim() !== '') : []
    return (
      <div className="space-y-2">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="text-gray-800">{paragraph}</p>
        ))}
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      {mode === 'view' ? (
        <div className="p-2  rounded-md">{renderViewMode()}</div>
      ) : (
        <textarea
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"

        />
      )}
      {mode !== 'view' && (
        <div className="text-sm text-gray-500 mt-1">
          {value?.length}/{maxLength} characters
        </div>
      )}
    </div>
  )
}

// Example usage documentation
export const examplesMultiLineText: ComponentDoc[] = [
  {
    id: 'MultiLineTextView',
    name: 'MultiLineText - View Mode',
    description: 'MultiLineText component in view mode, rendering each block as a separate paragraph',
    usage: `
<MultiLineText
  initialValue="This is the first paragraph in view mode.\n\nThis is the second paragraph.\nIt demonstrates how line breaks are handled."
  mode="view"
/>
    `,
    example: (
      <MultiLineText
        initialValue="This is the first paragraph in view mode.\n\nThis is the second paragraph.\nIt demonstrates how line breaks are handled."
        mode="view"
      />
    ),
  },
  {
    id: 'MultiLineTextNew',
    name: 'MultiLineText - New Mode',
    description: 'MultiLineText component in new mode',
    usage: `
<MultiLineText
  mode="new"
  placeholder="Enter new text here..."
  onChange={(mode, value) => console.log(mode, value)}
/>
    `,
    example: (
      <MultiLineText
        mode="new"
        placeholder="Enter new text here..."
        onChange={(mode, value) => console.log(mode, value)}
      />
    ),
  },
  {
    id: 'MultiLineTextEdit',
    name: 'MultiLineText - Edit Mode',
    description: 'MultiLineText component in edit mode',
    usage: `
<MultiLineText
  initialValue="This is editable text.\nYou can modify it.\n\nIt supports multiple paragraphs."
  mode="edit"
  onChange={(mode, value) => console.log(mode, value)}
  rows={6}
  maxLength={200}
/>
    `,
    example: (
      <MultiLineText
        initialValue="This is editable text.\nYou can modify it.\n\nIt supports multiple paragraphs."
        mode="edit"
        onChange={(mode, value) => console.log(mode, value)}
        rows={6}
        maxLength={200}
      />
    ),
  },
]