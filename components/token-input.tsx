"use client"

import React, { useState, useEffect } from "react"
import { FaCircle, FaSquare, FaStar } from "react-icons/fa"
import { ComponentDoc } from './component-documentation-hub'
import TokenInputInternal, { Property } from "./token-input-internal"

import { z } from "zod";




// Example usage
const example: Property = {
  name: "Color Options",
  values: [
    { value: "Red", icon: null, color: "#ff0000" },
    { value: "Blue", icon: null, color: "#0000ff" },
  ],
};


export interface ErrorDetail {
  token: string
  message: string
}

interface TokenInputProps {
  properties: Property[]
  value: string
  placeholder?: string
  onChange: (
    value: string,
    hasErrors: boolean,
    errors: ErrorDetail[]
  ) => void
  mode?: 'view' | 'new' | 'edit'
  className?: string
}

/**
 * TokenInput Component
 * 
 * This component is a wrapper around TokenInputInternal, providing a simplified interface
 * for inputting and managing tokens with predefined properties.
 * 
 * @param properties - An array of Property objects defining the available tokens
 * @param value - The current value of the input
 * @param onChange - Callback function triggered when the input value changes
 * @param mode - The current mode of the component ('view', 'new', or 'edit')
 * @param className - Additional CSS classes to apply to the component
 */
const TokenInput: React.FC<TokenInputProps> = ({
  properties,
  value,
  onChange,
  placeholder,
  mode = 'edit',
  className = ""
}) => {
  const [internalValue, setInternalValue] = useState(value)

  useEffect(() => {
    setInternalValue(value)
  }, [value])

  const handleChange = (
    newValue: string,
    hasErrors: boolean,
    errors: ErrorDetail[]
  ) => {
    setInternalValue(newValue)
    onChange(newValue, hasErrors, errors)
  }

  return (
    <TokenInputInternal
      properties={properties}
      value={internalValue}
      onChange={handleChange}
      placeholder={placeholder}


    />
  )
}

export default TokenInput

// Example usage and documentation
const ExampleComponent: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>(
    "color:blue shape:square shape:star other"
  )
  const [hasErrors, setHasErrors] = useState<boolean>(false)
  const [errors, setErrors] = useState<ErrorDetail[]>([])

  const properties = [
    {
      name: "color",
      values: [
        { value: "red", icon: <FaCircle color="red" />, color: "red" },
        { value: "green", icon: <FaCircle color="green" />, color: "green" },
        { value: "blue", icon: <FaCircle color="blue" />, color: "blue" },
        { value: "yellow", icon: <FaCircle color="yellow" />, color: "yellow" },
        { value: "purple", icon: <FaCircle color="purple" />, color: "purple" },
      ],
    },
    {
      name: "shape",
      values: [
        { value: "circle", icon: <FaCircle />, color: "black" },
        { value: "square", icon: <FaSquare />, color: "black" },
        { value: "star", icon: <FaStar />, color: "black" },
      ],
    },
    {
      name: "style",
      values: [
        {
          value: "bold",
          icon: <span className="font-bold">B</span>,
          color: "black",
        },
        {
          value: "italic",
          icon: <span className="italic">I</span>,
          color: "black",
        },
        {
          value: "underline",
          icon: <span className="underline">U</span>,
          color: "black",
        },
      ],
    },
  ]

  const handleTokenInputChange = (
    value: string,
    hasErrors: boolean,
    errors: ErrorDetail[]
  ) => {
    setInputValue(value)
    setHasErrors(hasErrors)
    setErrors(errors)
  }

  return (
    <div className="container mx-auto mt-10 p-4">
      <h1 className="text-2xl font-semibold mb-4">Token Input Component</h1>
      <TokenInput
        properties={properties}
        value={inputValue}
        onChange={handleTokenInputChange}
        mode="edit"
        className="mb-4"
      />
      <div className="mt-4">
        <h2 className="text-xl font-semibold">onChange Data:</h2>
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify({ value: inputValue, hasErrors, errors }, null, 2)}
        </pre>
      </div>
    </div>
  )
}

export const examplesTokenInput: ComponentDoc[] = [
  {
    id: 'TokenInput',
    name: 'TokenInput',
    description: 'A component for inputting and managing tokens with predefined properties.',
    usage: `
import React, { useState } from 'react'
import TokenInput from '@/components/token-input'
import { FaCircle, FaSquare, FaStar } from 'react-icons/fa'

const ExampleComponent: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>(
    "color:blue shape:square shape:star other"
  )
  const [hasErrors, setHasErrors] = useState<boolean>(false)
  const [errors, setErrors] = useState<ErrorDetail[]>([])

  const properties = [
    {
      name: "color",
      values: [
        { value: "red", icon: <FaCircle color="red" />, color: "red" },
        { value: "green", icon: <FaCircle color="green" />, color: "green" },
        { value: "blue", icon: <FaCircle color="blue" />, color: "blue" },
        { value: "yellow", icon: <FaCircle color="yellow" />, color: "yellow" },
        { value: "purple", icon: <FaCircle color="purple" />, color: "purple" },
      ],
    },
    {
      name: "shape",
      values: [
        { value: "circle", icon: <FaCircle />, color: "black" },
        { value: "square", icon: <FaSquare />, color: "black" },
        { value: "star", icon: <FaStar />, color: "black" },
      ],
    },
    {
      name: "style",
      values: [
        {
          value: "bold",
          icon: <span className="font-bold">B</span>,
          color: "black",
        },
        {
          value: "italic",
          icon: <span className="italic">I</span>,
          color: "black",
        },
        {
          value: "underline",
          icon: <span className="underline">U</span>,
          color: "black",
        },
      ],
    },
  ]

  const handleTokenInputChange = (
    value: string,
    hasErrors: boolean,
    errors: ErrorDetail[]
  ) => {
    setInputValue(value)
    setHasErrors(hasErrors)
    setErrors(errors)
  }

  return (
    <div className="container mx-auto mt-10 p-4">
      <h1 className="text-2xl font-semibold mb-4">Token Input Component</h1>
      <TokenInput
        properties={properties}
        value={inputValue}
        onChange={handleTokenInputChange}
        mode="edit"
        className="mb-4"
      />
      <div className="mt-4">
        <h2 className="text-xl font-semibold">onChange Data:</h2>
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify({ value: inputValue, hasErrors, errors }, null, 2)}
        </pre>
      </div>
    </div>
  )
}
    `,
    example: (
      <ExampleComponent />
    ),
  }
]