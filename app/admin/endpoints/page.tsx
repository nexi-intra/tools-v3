"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Search, Edit, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Endpoint {
  id: string
  name: string
  description: string
  version: string
  deprecated: boolean
  serviceId: string
  service: {
    id: string
    name: string
  }
}

interface Service {
  id: string
  name: string
}

export default function EndpointsPage() {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [serviceFilter, setServiceFilter] = useState("")

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // Fetch services first
        const servicesResponse = await fetch("/api/admin/services")
        const servicesData = await servicesResponse.json()
        setServices(servicesData.services)

        // Then fetch all endpoints
        const endpointsResponse = await fetch("/api/admin/services")
        const endpointsData = await endpointsResponse.json()

        // Extract all endpoints from all services
        const allEndpoints = endpointsData.services.flatMap((service: any) =>
          service.endpoints.map((endpoint: any) => ({
            ...endpoint,
            service: {
              id: service.id,
              name: service.name,
            },
          })),
        )

        setEndpoints(allEndpoints)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredEndpoints = endpoints.filter((endpoint) => {
    const matchesSearch =
      endpoint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      endpoint.service.name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesService = serviceFilter ? endpoint.service.id === serviceFilter : true

    return matchesSearch && matchesService
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Endpoints</h1>
          <p className="text-muted-foreground">Manage service endpoints</p>
        </div>
        <Link href="/admin/endpoints/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Endpoint
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search endpoints..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select value={serviceFilter} onValueChange={setServiceFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="All services" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All services</SelectItem>
            {services.map((service) => (
              <SelectItem key={service.id} value={service.id}>
                {service.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Endpoint</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-20 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredEndpoints.length > 0 ? (
              filteredEndpoints.map((endpoint) => (
                <TableRow key={endpoint.id}>
                  <TableCell className="font-medium">{endpoint.service.name}</TableCell>
                  <TableCell>{endpoint.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{endpoint.description}</TableCell>
                  <TableCell>v{endpoint.version}</TableCell>
                  <TableCell>
                    {endpoint.deprecated ? (
                      <Badge variant="destructive">Deprecated</Badge>
                    ) : (
                      <Badge variant="default">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/endpoints/${endpoint.id}`}>
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </Link>
                      <Button variant="outline" size="icon">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No endpoints found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

