"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, X, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

interface ServiceData {
  id: string
  name: string
  purpose: string
  active: boolean
  tags: { id: string; name: string }[]
  endpoints: any[]
}

export default function EditServicePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params

  const [service, setService] = useState<ServiceData | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    purpose: "",
    active: true,
    tags: [] as string[],
  })
  const [tagInput, setTagInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)

  useEffect(() => {
    async function fetchService() {
      try {
        const response = await fetch(`/api/admin/services/${id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch service")
        }

        setService(data.service)
        setFormData({
          name: data.service.name,
          purpose: data.service.purpose,
          active: data.service.active,
          tags: data.service.tags.map((tag: any) => tag.name),
        })
      } catch (error) {
        console.error("Error fetching service:", error)
        setError(error instanceof Error ? error.message : "Failed to fetch service")
      } finally {
        setFetchLoading(false)
      }
    }

    fetchService()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, active: checked }))
  }

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault()
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()],
        }))
      }
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validate form
      if (!formData.name.trim()) {
        throw new Error("Service name is required")
      }

      if (!formData.purpose.trim()) {
        throw new Error("Service purpose is required")
      }

      // Submit form
      const response = await fetch(`/api/admin/services/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update service")
      }

      // Update local state
      setService(data.service)

      // Show success message or redirect
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Failed to load service. Please try again."}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Service</h1>
        <p className="text-muted-foreground">Update service details for {service.name}</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Service Details</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints ({service.endpoints.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6 pt-4">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Service Details</CardTitle>
                <CardDescription>Update the details for this microservice</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Service Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., user.create"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Use dot notation for service names (e.g., domain.action)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose</Label>
                  <Textarea
                    id="purpose"
                    name="purpose"
                    placeholder="Describe what this service does..."
                    value={formData.purpose}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="Add tags and press Enter..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove {tag}</span>
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="active" checked={formData.active} onCheckedChange={handleSwitchChange} />
                  <Label htmlFor="active">Active</Label>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/services")}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="endpoints" className="pt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Endpoints</CardTitle>
                  <CardDescription>Manage endpoints for this service</CardDescription>
                </div>
                <Button onClick={() => router.push(`/admin/endpoints/new?serviceId=${id}`)}>Add Endpoint</Button>
              </div>
            </CardHeader>
            <CardContent>
              {service.endpoints.length === 0 ? (
                <div className="flex h-24 items-center justify-center rounded-md border border-dashed">
                  <p className="text-sm text-muted-foreground">No endpoints defined for this service yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {service.endpoints.map((endpoint) => (
                    <Card key={endpoint.id} className="overflow-hidden">
                      <div className="flex items-center justify-between p-4">
                        <div>
                          <h3 className="font-medium">{endpoint.name}</h3>
                          <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge variant="outline">v{endpoint.version}</Badge>
                            {endpoint.deprecated && <Badge variant="destructive">Deprecated</Badge>}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/endpoints/${endpoint.id}`)}
                        >
                          Edit
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

