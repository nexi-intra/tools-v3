'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Upload } from 'lucide-react'
import { ComponentDoc } from './component-documentation-hub'

/**
 * IconUploader Component
 * 
 * This component provides a versatile interface for uploading, editing, and viewing icons.
 * It supports drag and drop, paste, and click to upload functionalities.
 * 
 * Features:
 * - Three modes: 'new', 'edit', and 'view'
 * - Drag and drop file upload
 * - Paste image upload
 * - Click to upload
 * - Customizable size
 * - Responsive design
 * 
 * @param {Object} props - The properties that define the component's behavior
 * @param {string} [props.initialIcon] - The initial icon URL (if any)
 * @param {number} [props.size=100] - The size of the component in pixels
 * @param {'new' | 'edit' | 'view'} props.mode - The mode of the component
 * @param {function} props.onUpdate - Callback function when the icon is updated
 * @param {string} [props.className] - Additional CSS classes for the component
 */

interface IconUploaderProps {
  initialIcon?: string
  size?: number
  mode: 'new' | 'edit' | 'view'
  onUpdate: (mode: 'new' | 'edit' | 'view', icon: string | undefined) => void
  className?: string
}

export default function IconUploader({
  initialIcon = '',
  size = 100,
  mode,
  onUpdate,
  className = ''
}: IconUploaderProps) {
  const [icon, setIcon] = useState<string | null>(initialIcon)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIcon(initialIcon)
  }, [initialIcon])

  const handleFileChange = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setIcon(result)
      onUpdate(mode, result)
    }
    reader.readAsDataURL(file)
  }, [mode, onUpdate])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleFileChange(file)
    }
  }, [handleFileChange])

  const handleClick = useCallback(() => {
    if (mode !== 'view' && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [mode])

  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (mode === 'view') return
    const items = e.clipboardData?.items
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile()
          if (file) handleFileChange(file)
          break
        }
      }
    }
  }, [mode, handleFileChange])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.addEventListener('paste', handlePaste)
    }
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('paste', handlePaste)
      }
    }
  }, [handlePaste])

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`} ref={containerRef}>
      <div
        className={`relative  ${mode === 'view' ? '' : 'border-dashed'
          } rounded-lg overflow-hidden ${isDragging ? '' : ''
          } ${icon ? 'bg-white' : 'bg-gray-50'} ${mode !== 'view' ? 'cursor-pointer group' : ''}`}
        style={{ width: `${size}px`, height: `${size}px` }}
        onDragOver={mode !== 'view' ? handleDragOver : undefined}
        onDragLeave={mode !== 'view' ? handleDragLeave : undefined}
        onDrop={mode !== 'view' ? handleDrop : undefined}
        onClick={handleClick}
      >
        {icon ? (
          <>
            <img
              src={icon}
              alt="Uploaded icon"
              style={{ width: '100%', height: '100%', objectFit: 'fill' }}
            />
            {mode !== 'view' && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <p className="text-white text-sm text-center">Click to change</p>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            {mode === 'view' ? (
              <p className="text-sm text-gray-500">No icon available</p>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500 text-center">
                  Drag & drop, paste,<br />or click to upload
                </p>
              </>
            )}
          </div>
        )}
        {mode !== 'view' && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
            className="hidden"
          />
        )}
      </div>
      {/* <p className="text-sm text-gray-500">
        {mode === 'new' ? 'Upload a new icon' : mode === 'edit' ? 'Edit existing icon' : 'View icon'}
      </p> */}
    </div>
  )
}

export const examplesIconUploader: ComponentDoc[] = [
  {
    id: 'IconUploaderNew',
    name: 'IconUploader (New Mode)',
    description: 'A component for uploading a new icon. You can drag & drop, paste, or click to upload. After uploading, you can still change the icon by clicking on it.',
    usage: `
import IconUploader from './icon-uploader'

const handleIconUpdate = (mode: 'new' | 'edit' | 'view', icon: string | null) => {
  console.log('Icon updated:', { mode, icon })
}

<IconUploader 
  mode="new" 
  onUpdate={handleIconUpdate} 
  className="bg-gray-100 p-4 rounded-lg"
/>
    `,
    example: (
      <IconUploader
        mode="new"
        onUpdate={(mode, icon) => console.log('Icon updated:', { mode, icon })}
        className="bg-gray-100 p-4 rounded-lg"
      />
    ),
  },
  {
    id: 'IconUploaderEdit',
    name: 'IconUploader (Edit Mode)',
    description: 'A component for editing an existing icon. You can drag & drop, paste, or click to upload a new icon, even after an initial icon is set.',
    usage: `
import IconUploader from './icon-uploader'

const handleIconUpdate = (mode: 'new' | 'edit' | 'view', icon: string | null) => {
  console.log('Icon updated:', { mode, icon })
}

<IconUploader
  mode="edit"
  initialIcon="/placeholder.svg?height=100&width=100"
  onUpdate={handleIconUpdate}
  className="bg-blue-100 p-4 rounded-lg "
/>
    `,
    example: (
      <IconUploader
        mode="edit"
        initialIcon="/placeholder.svg?height=100&width=100"
        onUpdate={(mode, icon) => console.log('Icon updated:', { mode, icon })}
        className="bg-blue-100 p-4 rounded-lg"
      />
    ),
  },
  {
    id: 'IconUploaderView',
    name: 'IconUploader (View Mode)',
    description: 'A component for viewing an existing icon.',
    usage: `
import IconUploader from './icon-uploader'

const handleIconUpdate = (mode: 'new' | 'edit' | 'view', icon: string | null) => {
  console.log('Icon updated:', { mode, icon })
}

<IconUploader
  mode="view"
  initialIcon="/placeholder.svg?height=100&width=100"
  onUpdate={handleIconUpdate}
  className="bg-green-100 p-4 rounded-lg"
/>
    `,
    example: (
      <IconUploader
        mode="view"
        initialIcon="/placeholder.svg?height=100&width=100"
        onUpdate={(mode, icon) => console.log('Icon updated:', { mode, icon })}
        className="bg-green-100 p-4 rounded-lg"
      />
    ),
  },
]