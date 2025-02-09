'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Copy } from 'lucide-react'
import { Highlight, themes } from 'prism-react-renderer'


export interface CodeViwerProps {
  filename: string
  language: string
  code: string
}


export const CodeViewer: React.FC<CodeViwerProps> = ({ filename, language, code }) => {

  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="w-full max-w-4xl mx-auto">

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Usage</h2>
        <div className="relative">
          <Button
            variant="outline"
            size="icon"
            className="absolute top-2 right-2 z-10"
            onClick={() => copyToClipboard(code)}
          >
            <Copy className={copied ? "text-green-500" : ""} />
            <span className="sr-only">Copy code</span>
          </Button>
          <Highlight theme={themes.nightOwl} code={code} language={language}>
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



