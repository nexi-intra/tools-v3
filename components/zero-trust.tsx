'use client'

import React, { useState, useEffect } from 'react'
import { z } from 'zod'
import { AlertCircle, Info, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ComponentDoc } from './component-documentation-hub'

export type ActionLevel = 'info' | 'warn' | 'error' | 'fail'

const ZeroTrustPropsSchema = z.object({
  schema: z.instanceof(z.ZodType),
  props: z.record(z.any()),
  actionLevel: z.enum(['info', 'warn', 'error', 'fail']),
  componentName: z.string(),
  isDev: z.boolean().optional(),
})

type ZeroTrustProps = z.infer<typeof ZeroTrustPropsSchema>

export function ZeroTrust({ schema, props, actionLevel, componentName, isDev = process.env.NODE_ENV === 'development' }: ZeroTrustProps) {
  const [isExpanded, setIsExpanded] = useState(actionLevel !== 'info')
  const [validationError, setValidationError] = useState<z.ZodError | null>(null)

  useEffect(() => {
    try {
      ZeroTrustPropsSchema.parse({ schema, props, actionLevel, componentName, isDev })
    } catch (error) {
      console.error('Invalid props passed to ZeroTrust:', error)
      return
    }

    try {
      // Omit children from validation
      const { children, ...propsToValidate } = props
      schema.parse(propsToValidate)
      setValidationError(null)
    } catch (error) {
      if (error instanceof z.ZodError) {
        setValidationError(error)
        if (actionLevel === 'fail') {
          throw new Error(`Validation failed in ${componentName}: ${error.message}`)
        }
      }
    }
  }, [schema, props, actionLevel, componentName, isDev])

  if (!validationError) {
    return null
  }

  const getIcon = () => {
    switch (actionLevel) {
      case 'info':
        return <Info className="w-5 h-5" />
      case 'warn':
      case 'error':
        return <AlertCircle className="w-5 h-5" />
      default:
        return null
    }
  }

  const getColor = () => {
    switch (actionLevel) {
      case 'info':
        return 'text-blue-500'
      case 'warn':
        return 'text-yellow-500'
      case 'error':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  const getMessage = () => {
    return <p>{`${actionLevel.charAt(0).toUpperCase() + actionLevel.slice(1)} in ${componentName}`}</p>
  }

  const getDetails = () => {
    return validationError.errors.map((error, index) => (
      <div key={index} className="mt-2">
        <strong>{error.path.join('.')}: </strong>
        {error.message}
      </div>
    ))
  }

  return (
    <div className={`relative ${getColor()} p-2 rounded-md`}>
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-transparent border-none cursor-pointer"
          aria-label={`Expand ${actionLevel} message for ${componentName}`}
        >
          {getIcon()}
        </button>
      ) : (
        <div className="flex items-center">
          {getIcon()}
          <div className="ml-3 flex-1">
            {getMessage()}
          </div>
          {isDev && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="ml-2">
                  Details
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{`${actionLevel.charAt(0).toUpperCase() + actionLevel.slice(1)} Details for ${componentName}`}</DialogTitle>
                </DialogHeader>
                {getDetails()}
              </DialogContent>
            </Dialog>
          )}
          <button
            onClick={() => setIsExpanded(false)}
            className="ml-auto bg-transparent border-none cursor-pointer"
            aria-label={`Collapse ${actionLevel} message for ${componentName}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}

// Example schema and component for the examples
const ExampleSchema = z.object({
  name: z.string(),
  age: z.number().int().positive(),
  email: z.string().email(),
})

function ExampleComponent({ name, age, email }: z.infer<typeof ExampleSchema>) {
  return (
    <div className="p-4 border rounded-md mb-4">
      <h2 className="text-lg font-bold">{name}</h2>
      <p>Age: {age}</p>
      <p>Email: {email}</p>
    </div>
  )
}

// More complex example with children
const ComplexExampleSchema = z.object({
  title: z.string(),
  items: z.array(z.object({
    id: z.number(),
    name: z.string(),
    value: z.number(),
  })),
})

function ComplexExampleComponent({ title, items, children }: z.infer<typeof ComplexExampleSchema> & { children: React.ReactNode }) {
  return (
    <div className="p-4 border rounded-md mb-4">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <ul className="list-disc pl-5 mb-4">
        {items.map((item) => (
          <li key={item.id}>
            {item.name}: {item.value}
          </li>
        ))}
      </ul>
      <div className="bg-gray-100 p-4 rounded-md">
        <h3 className="text-lg font-semibold mb-2">Children Content:</h3>
        {children}
      </div>
    </div>
  )
}

export const examplesZeroTrust: ComponentDoc[] = [
  {
    id: 'ZeroTrust-Info-Dev',
    name: 'ZeroTrust (Info, Dev Mode)',
    description: 'ZeroTrust component with info action level in development mode',
    usage: `
import ZeroTrust from './zero-trust'
import { z } from 'zod'

const ExampleSchema = z.object({
  name: z.string(),
  age: z.number().int().positive(),
  email: z.string().email(),
})

<ZeroTrust
  schema={ExampleSchema}
  props={{ name: 'John Doe', age: 'thirty', email: 'john@example' }}
  actionLevel="info"
  componentName="ExampleComponent"
  isDev={true}
/>
`,
    example: (
      <ZeroTrust
        schema={ExampleSchema}
        props={{ name: 'John Doe', age: 'thirty', email: 'john@example' }}
        actionLevel="info"
        componentName="ExampleComponent"
        isDev={true}
      />
    ),
  },
  {
    id: 'ZeroTrust-Info-Prod',
    name: 'ZeroTrust (Info, Prod Mode)',
    description: 'ZeroTrust component with info action level in production mode',
    usage: `
<ZeroTrust
  schema={ExampleSchema}
  props={{ name: 'John Doe', age: 'thirty', email: 'john@example' }}
  actionLevel="info"
  componentName="ExampleComponent"
  isDev={false}
/>
`,
    example: (
      <ZeroTrust
        schema={ExampleSchema}
        props={{ name: 'John Doe', age: 'thirty', email: 'john@example' }}
        actionLevel="info"
        componentName="ExampleComponent"
        isDev={false}
      />
    ),
  },
  {
    id: 'ZeroTrust-Warn-Dev',
    name: 'ZeroTrust (Warn, Dev Mode)',
    description: 'ZeroTrust component with warn action level in development mode',
    usage: `
<ZeroTrust
  schema={ExampleSchema}
  props={{ name: 'Jane Doe', age: -5, email: 'jane@example.com' }}
  actionLevel="warn"
  componentName="ExampleComponent"
  isDev={true}
/>
`,
    example: (
      <ZeroTrust
        schema={ExampleSchema}
        props={{ name: 'Jane Doe', age: -5, email: 'jane@example.com' }}
        actionLevel="warn"
        componentName="ExampleComponent"
        isDev={true}
      />
    ),
  },
  {
    id: 'ZeroTrust-Warn-Prod',
    name: 'ZeroTrust (Warn, Prod Mode)',
    description: 'ZeroTrust component with warn action level in production mode',
    usage: `
<ZeroTrust
  schema={ExampleSchema}
  props={{ name: 'Jane Doe', age: -5, email: 'jane@example.com' }}
  actionLevel="warn"
  componentName="ExampleComponent"
  isDev={false}
/>
`,
    example: (
      <ZeroTrust
        schema={ExampleSchema}
        props={{ name: 'Jane Doe', age: -5, email: 'jane@example.com' }}
        actionLevel="warn"
        componentName="ExampleComponent"
        isDev={false}
      />
    ),
  },
  {
    id: 'ZeroTrust-Error-Dev',
    name: 'ZeroTrust (Error, Dev Mode)',
    description: 'ZeroTrust component with error action level in development mode',
    usage: `
<ZeroTrust
  schema={ExampleSchema}
  props={{ name: 123, age: 'forty', email: 'notanemail' }}
  actionLevel="error"
  componentName="ExampleComponent"
  isDev={true}
/>
`,
    example: (
      <ZeroTrust
        schema={ExampleSchema}
        props={{ name: 123, age: 'forty', email: 'notanemail' }}
        actionLevel="error"
        componentName="ExampleComponent"
        isDev={true}
      />
    ),
  },
  {
    id: 'ZeroTrust-Error-Prod',
    name: 'ZeroTrust (Error, Prod Mode)',
    description: 'ZeroTrust component with error action level in production mode',
    usage: `
<ZeroTrust
  schema={ExampleSchema}
  props={{ name: 123, age: 'forty', email: 'notanemail' }}
  actionLevel="error"
  componentName="ExampleComponent"
  isDev={false}
/>
`,
    example: (
      <ZeroTrust
        schema={ExampleSchema}
        props={{ name: 123, age: 'forty', email: 'notanemail' }}
        actionLevel="error"
        componentName="ExampleComponent"
        isDev={false}
      />
    ),
  },
  {
    id: 'ZeroTrust-Fail',
    name: 'ZeroTrust (Fail)',
    description: 'ZeroTrust component with fail action level (throws an error)',
    usage: `
try {
  <ZeroTrust
    schema={ExampleSchema}
    props={{ name: 123, age: 'forty', email: 'notanemail' }}
    actionLevel="fail"
    componentName="ExampleComponent"
  />
} catch (error) {
  console.error(error)
  // Handle the error or display an error message
}
`,
    example: (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        This example would throw an error in actual usage and stop rendering.
      </div>
    ),
  },
  {
    id: 'ZeroTrust-Complex-Example',
    name: 'ZeroTrust (Complex Example with Children)',
    description: 'ZeroTrust component with a more complex schema and children props',
    usage: `
import ZeroTrust from './zero-trust'
import { z } from 'zod'

const ComplexExampleSchema = z.object({
  title: z.string(),
  items: z.array(z.object({
    id: z.number(),
    name: z.string(),
    value: z.number(),
  })),
})

function ComplexExampleComponent({ title, items, children }) {
  return (
    <div className="p-4 border rounded-md mb-4">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <ul className="list-disc pl-5 mb-4">
        {items.map((item) => (
          <li key={item.id}>
            {item.name}: {item.value}
          </li>
        ))}
      </ul>
      <div className="bg-gray-100 p-4 rounded-md">
        <h3 className="text-lg font-semibold mb-2">Children Content:</h3>
        {children}
      </div>
    </div>
  )
}

<ZeroTrust
  schema={ComplexExampleSchema}
  props={{
    title: "Complex Example",
    items: [
      { id: 1, name: "Item 1", value: 100 },
      { id: 2, name: "Item 2", value: "invalid" },
    ],
    children: <p>This is child content</p>
  }}
  actionLevel="warn"
  componentName="ComplexExampleComponent"
  isDev={true}
/>
<ComplexExampleComponent
  title="Complex Example"
  items={[
    { id: 1, name: "Item 1", value: 100 },
    { id: 2, name: "Item 2", value: 200 },
  ]}
>
  <p>This is child content</p>
</ComplexExampleComponent>
`,
    example: (
      <>
        <ZeroTrust
          schema={ComplexExampleSchema}
          props={{
            title: "Complex Example",
            items: [
              { id: 1, name: "Item 1", value: 100 },
              { id: 2, name: "Item 2", value: "invalid" },
            ],
            children: <p>This is child content</p>
          }}
          actionLevel="warn"
          componentName="ComplexExampleComponent"
          isDev={true}
        />
        <ComplexExampleComponent
          title="Complex Example"
          items={[
            { id: 1, name: "Item 1", value: 100 },
            {
              id: 2, name: "Item 2",

              value: 200
            },
          ]}
        >
          <p>This is child content</p>
        </ComplexExampleComponent>
      </>
    ),
  },
]