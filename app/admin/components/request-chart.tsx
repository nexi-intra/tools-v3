"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

interface RequestData {
  date: string
  count: number
}

export function RequestChart() {
  const [requestData, setRequestData] = useState<RequestData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/admin/stats")
        const data = await response.json()
        setRequestData(data.requestsByDay || [])
      } catch (error) {
        console.error("Error fetching request data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Format dates for display
  const formattedData = requestData.map((item) => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }))

  // Find max value for scaling
  const maxCount = Math.max(...formattedData.map((d) => d.count), 10)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Volume</CardTitle>
        <CardDescription>Daily request volume over time</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="7days">
          <TabsList className="mb-4">
            <TabsTrigger value="7days">7 days</TabsTrigger>
            <TabsTrigger value="30days" disabled>
              30 days
            </TabsTrigger>
            <TabsTrigger value="90days" disabled>
              90 days
            </TabsTrigger>
          </TabsList>
          <TabsContent value="7days" className="h-[200px]">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Skeleton className="h-[180px] w-full" />
              </div>
            ) : formattedData.length > 0 ? (
              <div className="h-full">
                <div className="flex h-full items-end gap-2">
                  {formattedData.map((day, i) => (
                    <div key={i} className="relative flex h-full w-full flex-col justify-end">
                      <div
                        className="w-full bg-primary rounded-t"
                        style={{
                          height: `${(day.count / maxCount) * 100}%`,
                          minHeight: "4px",
                        }}
                      />
                      <span className="mt-2 w-full text-center text-xs text-muted-foreground">{day.formattedDate}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">No data available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

