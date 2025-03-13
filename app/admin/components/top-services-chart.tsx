"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface ServiceData {
  name: string
  count: number
}

export function TopServicesChart() {
  const [serviceData, setServiceData] = useState<ServiceData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/admin/stats")
        const data = await response.json()
        setServiceData(data.topServices || [])
      } catch (error) {
        console.error("Error fetching service data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Find max value for scaling
  const maxCount = Math.max(...serviceData.map((d) => d.count), 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Services</CardTitle>
        <CardDescription>Most frequently used services</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>
        ) : serviceData.length > 0 ? (
          <div className="space-y-4">
            {serviceData.map((service, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-32 truncate font-medium">{service.name}</div>
                <div className="flex-1">
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${(service.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-sm tabular-nums text-muted-foreground">{service.count}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-[200px] items-center justify-center">
            <p className="text-sm text-muted-foreground">No data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

