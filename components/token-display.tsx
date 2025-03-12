"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TokenDisplayProps {
  token: string
  title?: string
}

export default function TokenDisplay({ token, title = "Your Token" }: TokenDisplayProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(token)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Token copied to clipboard successfully",
      })

      // Reset the copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Split the token into its three parts for better display
  const tokenParts = token.split(".")

  return (
    <Card className="w-full max-w-2xl shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* <div className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto">
          {tokenParts.map((part, index) => (
            <div key={index} className={`mb-1 ${index < tokenParts.length - 1 ? "pb-1 border-b border-border" : ""}`}>
              <span className="text-muted-foreground mr-2">
                {index === 0 ? "Header:" : index === 1 ? "Payload:" : "Signature:"}
              </span>
              <span className="break-all">{part}</span>
            </div>
          ))}
        </div> */}

        <div className="mt-6 bg-primary/5 p-4 rounded-md border border-primary/20">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
              <Copy className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-medium">Copy this token</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Click the button below to copy the entire token to your clipboard.
          </p>
          <Button
            onClick={copyToClipboard}
            className="w-full flex items-center justify-center gap-2"
            variant={copied ? "outline" : "default"}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied to clipboard!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy token
              </>
            )}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        This token contains sensitive information. Do not share it publicly.
      </CardFooter>
    </Card>
  )
}

