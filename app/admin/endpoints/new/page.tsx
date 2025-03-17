"use client"

import { Badge } from "@/components/ui/badge"

import { Skeleton } from "@/components/ui/skeleton"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Plus, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Service {
  id: string
  name: string
}

interface Parameter {
  name: string
  type: string
  required: boolean
  description: string
}

interface SchemaProperty {
  name: string
  type: string
  description: string
  format?: string
}

export default function NewEndpointPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedServiceId = searchParams.get("serviceId")

  const [services, setServices] = useState<Service[]>([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    version: "1.0.0",
    deprecated: false,
    serviceId: preselectedServiceId || "",
  })
  const [parameters, setParameters] = useState<Parameter[]>([])
  const [newParameter, setNewParameter] = useState<Parameter>({
    name: "",
    type: "string",
    required: false,
    description: "",
  })
  const [properties, setProperties] = useState<SchemaProperty[]>([])
  const [newProperty, setNewProperty] = useState<SchemaProperty>({
    name: "",
    type: "string",
    description: "",
    format: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [servicesLoading, setServicesLoading] = useState(true)

  useEffect(() => {
    async function fetchServices() {
      try {
        const response = await fetch("/api/admin/services")
        const data = await response.json()
        setServices(data.services)
      } catch (error) {
        console.error("Error fetching services:", error)
      } finally {
        setServicesLoading(false)
      }
    }

    fetchServices()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, deprecated: checked }))
  }

  const handleParameterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewParameter((prev) => ({ ...prev, [name]: value }))
  }

  const handleParameterRequiredChange = (checked: boolean) => {
    setNewParameter((prev) => ({ ...prev, required: checked }))
  }

  const handleAddParameter = () => {
    if (!newParameter.name.trim()) return

    setParameters((prev) => [...prev, { ...newParameter }])
    setNewParameter({
      name: "",
      type: "string",
      required: false,
      description: "",
    })
  }

  const handleRemoveParameter = (index: number) => {
    setParameters((prev) => prev.filter((_, i) => i !== index))
  }

  const handlePropertyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewProperty((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddProperty = () => {
    if (!newProperty.name.trim()) return

    setProperties((prev) => [...prev, { ...newProperty }])
    setNewProperty({
      name: "",
      type: "string",
      description: "",
      format: "",
    })
  }

  const handleRemoveProperty = (index: number) => {
    setProperties((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validate form
      if (!formData.name.trim()) {
        throw new Error("Endpoint name is required")
      }

      if (!formData.description.trim()) {
        throw new Error("Endpoint description is required")
      }

      if (!formData.serviceId) {
        throw new Error("Service is required")
      }

      // Prepare response schema
      const responseSchema =
        properties.length > 0
          ? {
              type: "object",
              properties: properties.reduce(
                (acc, prop) => {
                  acc[prop.name] = {
                    type: prop.type,
                    description: prop.description,
                    ...(prop.format && { format: prop.format }),
                  }
                  return acc
                },
                {} as Record<string, any>,
              ),
            }
          : undefined

      // Submit form
      const response = await fetch("/api/admin/endpoints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          parameters,
          responseSchema,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create endpoint")
      }

      // Redirect to endpoints page or service detail page
      if (preselectedServiceId) {
        router.push(`/admin/services/${preselectedServiceId}`)
      } else {
        router.push("/admin/endpoints")
      }
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Endpoint</h1>
        <p className="text-muted-foreground">Create a new endpoint for a microservice</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the basic details for the new endpoint</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="serviceId">Service</Label>
                {servicesLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    name="serviceId"
                    value={formData.serviceId}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, serviceId: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Endpoint Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., createUser"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe what this endpoint does..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  name="version"
                  placeholder="e.g., 1.0.0"
                  value={formData.version}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="deprecated" checked={formData.deprecated} onCheckedChange={handleSwitchChange} />
                <Label htmlFor="deprecated">Deprecated</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Parameters</CardTitle>
              <CardDescription>Define the parameters for this endpoint</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {parameters.map((param, index) => (
                  <div key={index} className="flex items-center gap-2 rounded-md border p-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{param.name}</span>
                        <Badge variant={param.required ? "default" : "outline"} className="text-xs">
                          {param.required ? "Required" : "Optional"}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {param.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{param.description}</p>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveParameter(index)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove parameter</span>
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-4 rounded-md border p-4">
                <h4 className="text-sm font-medium">Add Parameter</h4>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="paramName">Name</Label>
                    <Input
                      id="paramName"
                      name="name"
                      placeholder="e.g., username"
                      value={newParameter.name}
                      onChange={handleParameterChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paramType">Type</Label>
                    <Select
                      name="type"
                      value={newParameter.type}
                      onValueChange={(value) => setNewParameter((prev) => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger id="paramType">
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="object">Object</SelectItem>
                        <SelectItem value="array">Array</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paramDescription">Description</Label>
                  <Textarea
                    id="paramDescription"
                    name="description"
                    placeholder="Describe this parameter..."
                    value={newParameter.description}
                    onChange={handleParameterChange}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="paramRequired"
                    checked={newParameter.required}
                    onCheckedChange={handleParameterRequiredChange}
                  />
                  <Label htmlFor="paramRequired">Required</Label>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddParameter}
                  disabled={!newParameter.name.trim()}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Parameter
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Response Schema</CardTitle>
              <CardDescription>Define the response schema for this endpoint</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {properties.map((prop, index) => (
                  <div key={index} className="flex items-center gap-2 rounded-md border p-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{prop.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {prop.type}
                        </Badge>
                        {prop.format && (
                          <Badge variant="outline" className="text-xs">
                            {prop.format}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{prop.description}</p>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveProperty(index)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove property</span>
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-4 rounded-md border p-4">
                <h4 className="text-sm font-medium">Add Response Property</h4>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="propName">Name</Label>
                    <Input
                      id="propName"
                      name="name"
                      placeholder="e.g., userId"
                      value={newProperty.name}
                      onChange={handlePropertyChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="propType">Type</Label>
                    <Select
                      name="type"
                      value={newProperty.type}
                      onValueChange={(value) => setNewProperty((prev) => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger id="propType">
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="string">String</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="object">Object</SelectItem>
                        <SelectItem value="array">Array</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="propDescription">Description</Label>
                  <Textarea
                    id="propDescription"
                    name="description"
                    placeholder="Describe this property..."
                    value={newProperty.description}
                    onChange={handlePropertyChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="propFormat">Format (Optional)</Label>
                  <Input
                    id="propFormat"
                    name="format"
                    placeholder="e.g., date-time, email, uuid"
                    value={newProperty.format}
                    onChange={handlePropertyChange}
                  />
                </div>

                <Button type="button" variant="outline" onClick={handleAddProperty} disabled={!newProperty.name.trim()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Property
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Endpoint"}
          </Button>
        </div>
      </form>
    </div>
  )
}

