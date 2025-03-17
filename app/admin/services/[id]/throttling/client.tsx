"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

interface ServiceData {
  id: string
  name: string
  throttleEnabled: boolean
  requestsPerMinute: number | null
  requestsPerHour: number | null
  requestsPerDay: number | null
}

export default function ServiceThrottlingPage({ id }: { id: string }) {
  const router = useRouter()

  const [service, setService] = useState<ServiceData | null>(null)
  const [formData, setFormData] = useState({
    throttleEnabled: false,
    requestsPerMinute: "",
    requestsPerHour: "",
    requestsPerDay: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
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
          throttleEnabled: data.service.throttleEnabled || false,
          requestsPerMinute: data.service.requestsPerMinute?.toString() || "",
          requestsPerHour: data.service.requestsPerHour?.toString() || "",
          requestsPerDay: data.service.requestsPerDay?.toString() || "",
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, throttleEnabled: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      // Prepare the data
      const updateData = {
        throttleEnabled: formData.throttleEnabled,
        requestsPerMinute: formData.requestsPerMinute ? Number.parseInt(formData.requestsPerMinute) : null,
        requestsPerHour: formData.requestsPerHour ? Number.parseInt(formData.requestsPerHour) : null,
        requestsPerDay: formData.requestsPerDay ? Number.parseInt(formData.requestsPerDay) : null,
      }

      // Submit form
      const response = await fetch(`/api/admin/services/${id}/throttling`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update throttling settings")
      }

      // Update local state
      setService((prev) => (prev ? { ...prev, ...updateData } : null))
      setSuccess("Throttling settings updated successfully")
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
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/services/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Throttling Settings</h1>
          <p className="text-muted-foreground">Configure rate limits for {service.name}</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="default">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Rate Limiting</CardTitle>
            <CardDescription>
              Configure rate limits for this service. These limits can be overridden at the endpoint level.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-2">
              <Switch id="throttleEnabled" checked={formData.throttleEnabled} onCheckedChange={handleSwitchChange} />
              <Label htmlFor="throttleEnabled">Enable Rate Limiting</Label>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="requestsPerMinute">Requests Per Minute</Label>
                <Input
                  id="requestsPerMinute"
                  name="requestsPerMinute"
                  type="number"
                  placeholder="Leave empty for no limit"
                  value={formData.requestsPerMinute}
                  onChange={handleChange}
                  disabled={!formData.throttleEnabled}
                />
                <p className="text-xs text-muted-foreground">Maximum number of requests allowed per minute</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requestsPerHour">Requests Per Hour</Label>
                <Input
                  id="requestsPerHour"
                  name="requestsPerHour"
                  type="number"
                  placeholder="Leave empty for no limit"
                  value={formData.requestsPerHour}
                  onChange={handleChange}
                  disabled={!formData.throttleEnabled}
                />
                <p className="text-xs text-muted-foreground">Maximum number of requests allowed per hour</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requestsPerDay">Requests Per Day</Label>
                <Input
                  id="requestsPerDay"
                  name="requestsPerDay"
                  type="number"
                  placeholder="Leave empty for no limit"
                  value={formData.requestsPerDay}
                  onChange={handleChange}
                  disabled={!formData.throttleEnabled}
                />
                <p className="text-xs text-muted-foreground">Maximum number of requests allowed per day</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push(`/admin/services/${id}`)}>
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
    </div>
  )
}

