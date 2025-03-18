"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Copy, Check } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function NewApiKeyPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    active: true,
    expiresAt: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [newApiKey, setNewApiKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, active: checked }))
  }

  const handleCopyKey = async () => {
    if (newApiKey) {
      await navigator.clipboard.writeText(newApiKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validate form
      if (!formData.name.trim()) {
        throw new Error("API key name is required")
      }

      // Submit form
      const response = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create API key")
      }

      // Store the new API key
      setNewApiKey(data.apiKey.key)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Generate API Key</h1>
        <p className="text-muted-foreground">Create a new API key for authenticating with the microservice broker</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {newApiKey ? (
        <div className="space-y-6">
          <Alert variant="default">
            <Check className="h-4 w-4" />
            <AlertTitle>API Key Generated</AlertTitle>
            <AlertDescription>
              Your new API key has been generated. Make sure to copy it now as you won't be able to see it again.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle>Your New API Key</CardTitle>
              <CardDescription>Copy this key and store it securely. It will not be shown again.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-muted p-3 text-sm font-mono break-all">{newApiKey}</code>
                <Button variant="outline" size="sm" className="flex-shrink-0" onClick={handleCopyKey}>
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => router.push("/admin/api-keys")}>Done</Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>API Key Details</CardTitle>
              <CardDescription>Enter the details for the new API key</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Production API Key"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <p className="text-xs text-muted-foreground">A descriptive name to identify this API key</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="What is this API key used for?"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
                <Input id="expiresAt" name="expiresAt" type="date" value={formData.expiresAt} onChange={handleChange} />
                <p className="text-xs text-muted-foreground">Leave blank for a non-expiring API key</p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="active" checked={formData.active} onCheckedChange={handleSwitchChange} />
                <Label htmlFor="active">Active</Label>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/api-keys")}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Generating..." : "Generate API Key"}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

