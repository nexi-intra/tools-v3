'use client'

import React, { useState, useEffect, useRef, JSX } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy } from 'lucide-react'
import { Highlight, themes } from 'prism-react-renderer'


export interface ComponentDoc {
  id: string
  name: string
  description: string
  usage: string
  example: JSX.Element
}

export interface ComponentDocumentationProps {
  component: ComponentDoc
}

/**
 * ComponentDocumentation
 * 
 * A component for documenting and showcasing a single component with an interactive
 * table of contents, live component preview, and syntax-highlighted usage example.
 */
export const ComponentDocumentation: React.FC<ComponentDocumentationProps> = ({ component }) => {
  const componentsRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">{component.name} Component</h1>
      <section id={`${component.id}-examples`} className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Examples</h2>
        <Card>
          <CardHeader>
            <CardTitle>Live Example</CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={componentsRef} className='shadow-2xl bg-muted'>
              {component.example}
            </div>
          </CardContent>
        </Card>
      </section>
      <section id={`${component.id}-overview`} className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <p className="text-gray-700 dark:text-gray-300">{component.description}</p>
      </section>

      <section id={`${component.id}-usage`} className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Usage</h2>
        <div className="relative">
          <Button
            variant="outline"
            size="icon"
            className="absolute top-2 right-2 z-10"
            onClick={() => copyToClipboard(component.usage)}
          >
            <Copy className={copied ? "text-green-500" : ""} />
            <span className="sr-only">Copy code</span>
          </Button>
          <Highlight theme={themes.nightOwl} code={component.usage} language="tsx">
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
              <pre className={`${className} p-4 rounded-md overflow-auto text-sm`} style={style}>
                {tokens.map((line, i) => (
                  <div key={i} {...getLineProps({ line, key: i })}>
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token, key })} />
                    ))}
                  </div>
                ))}
              </pre>
            )}
          </Highlight>
        </div>
      </section>
    </div>
  )
}

interface ComponentDocumentationHubProps {
  components: ComponentDoc[]
}

/**
 * ComponentDocumentationHub
 * 
 * A high-level component that accepts one or more sets of component documentations
 * and displays them with a shared table of contents.
 */
export const ComponentDocumentationHub: React.FC<ComponentDocumentationHubProps> = ({ components }) => {
  const [activeSection, setActiveSection] = useState<string>('')

  const allSections = components.flatMap(component => [
    { id: `${component.id}-overview`, title: `${component.name} Overview` },
    { id: `${component.id}-usage`, title: `${component.name} Usage` },
    { id: `${component.id}-props`, title: `${component.name} Props` },
    { id: `${component.id}-examples`, title: `${component.name} Examples` },
  ])

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    }

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id)
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    allSections.forEach((section) => {
      const element = document.getElementById(section.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [allSections])

  return (
    <div className="flex flex-col md:flex-row">
      <div className="w-full pr-0 md:pr-8 mb-8 md:mb-0">
        {components.map((component, index) => (
          <ComponentDocumentation key={index} component={component} />
        ))}
      </div>
    </div>
  )
}