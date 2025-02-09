"use client"
import * as React from 'react'
import { z } from 'zod'
import { Share2 } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ZeroTrust } from '@/components/zero-trust'
import { kVerbose, kWarn, kInfo, kError } from "@/lib/koksmat-logger-client"
import { ComponentDoc } from './component-documentation-hub'

import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'

/**
 * ShareComponent
 * 
 * This component provides a sharing interface for content. It includes:
 * - A trigger button with a share icon
 * - A popover with sharing options
 * - Buttons for various sharing platforms
 * - A URL field for easy copying
 * - An option to set a start time for the content
 * 
 * The component supports view, new, and edit modes, and calls a callback function
 * with the current mode and values when actions are performed.
 * 
 * Usage:
 * <ShareComponent 
 *   url="https://example.com/content"
 *   subscriberCount={100}
 *   onShare={(platform) => console.log(`Shared on ${platform}`)}
 *   onCreatePost={() => console.log("Create post clicked")}
 *   className="custom-class"
 * />
 */

// Proxy ZeroTrust component
const ProxyZeroTrust: React.FC<any> = () => null;

// Proxy logger functions
const proxyLogger = (...args: any[]) => { };

const ShareComponentSchema = z.object({
  //url: z.string().url(),
  subscriberCount: z.number().int().nonnegative(),
  onShare: z.function().args(z.string()).returns(z.void()),
  onCreatePost: z.function().returns(z.void()),
  className: z.string().optional(),
})

type ShareComponentProps = z.infer<typeof ShareComponentSchema>

export function ShareComponent({

  subscriberCount,
  onShare,
  onCreatePost,
  className = '',
}: ShareComponentProps) {
  const [mode, setMode] = React.useState<'view' | 'new' | 'edit'>('view')
  const [startTime, setStartTime] = React.useState('0:00')
  const [url, seturl] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const addr = window.location.href
    const protocol = addr.split('//')
    const [p, rest] = protocol
    const [host, ...path] = rest.split('/')
    const escapedPath = encodeURIComponent(path.join('/'))
    const newUrl = `${p}//${host}/sso?token=TOKEN&path=${escapedPath}`

    seturl(newUrl)


  }, [])


  const handleShare = (platform: string) => {
    onShare(platform)
    proxyLogger(`Shared on ${platform}`)
    toast({
      title: `Shared on ${platform}`,
      description: "Your content has been shared successfully.",
    })
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "URL Copied",
        description: "The URL has been copied to your clipboard.",
      })
      proxyLogger('URL copied to clipboard')
    }).catch((err) => {
      toast({
        title: "Copy Failed",
        description: "Failed to copy the URL. Please try again.",
        variant: "destructive",
      })
      proxyLogger('Failed to copy URL', err)
    })
  }

  const handleCreatePost = () => {
    onCreatePost()
    proxyLogger('Create post clicked')
    toast({
      title: "Create Post",
      description: "You can now create a post.",
    })
  }

  const shareOptions = [
    { name: 'Embed', icon: '< >' },
    // { name: 'WhatsApp', icon: '📱' },
    // { name: 'Facebook', icon: 'f' },
    // { name: 'X', icon: '𝕏' },
    // { name: 'Email', icon: '✉️' },
    // { name: 'KakaoTalk', icon: '💬' },
  ]

  return (
    <>
      <ProxyZeroTrust
        schema={ShareComponentSchema}
        props={{ url, subscriberCount, onShare, onCreatePost, className }}
        actionLevel="error"
        componentName="ShareComponent"
      />
      <TooltipProvider>
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className={className}>
                  <Share2 className="h-4 w-4" />
                  <span className="sr-only">Share content</span>
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Share this content</p>
            </TooltipContent>
          </Tooltip>
          <PopoverContent className="w-80">
            <div className="flex flex-col space-y-4">
              {/* <h3 className="text-lg font-semibold">Share in a post</h3>
              <Button onClick={handleCreatePost}>Create post</Button>
              <p className="text-sm text-gray-500">{subscriberCount} subscribers</p> */}
              <div className="flex flex-wrap justify-start gap-2 hidden">
                {shareOptions.map((option) => (
                  <Tooltip key={option.name}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full w-10 h-10"
                        onClick={() => navigator.clipboard.writeText(url)}
                      >
                        {option.icon}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{option.name}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <Input value={url} readOnly className="flex-grow" />
                <Button onClick={handleCopy}>Copy</Button>
              </div>

            </div>
          </PopoverContent>
        </Popover>
      </TooltipProvider>
    </>
  )
}

export const examplesShareComponent: ComponentDoc[] = [
  {
    id: 'ShareComponent',
    name: 'ShareComponent',
    description: 'A component for sharing content across various platforms.',
    usage: `
import { ShareComponent } from '@/components/share-component'
import { Toaster } from "@/components/ui/toaster"

export default function MyPage() {
  return (
    <>
      <ShareComponent 
        url="https://example.com/content"
        subscriberCount={100}
        onShare={(platform) => console.log(\`Shared on \${platform}\`)}
        onCreatePost={() => console.log("Create post clicked")}
        className="custom-class"
      />
      <Toaster />
    </>
  )
}
    `,
    example: (
      <>
        <ShareComponent

          subscriberCount={100}
          onShare={(platform) => proxyLogger(`Shared on ${platform}`)}
          onCreatePost={() => proxyLogger("Create post clicked")}
        />
      </>
    ),
  }
]

