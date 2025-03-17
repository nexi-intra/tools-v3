"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface Log {
  id: string
  serviceName: string
  requestId: string
  status: string
  processingTime: number | null
  createdAt: string
}

export function RecentLogsTable() {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLogs() {
      try {
        const response = await fetch("/api/admin/logs?page=1&pageSize=5")
        const data = await response.json()
        setLogs(data.logs)
      } catch (error) {
        console.error("Error fetching logs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Service</TableHead>
            <TableHead>Request ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Processing Time</TableHead>
            <TableHead>Time</TableHead>
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
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
              </TableRow>
            ))
          ) : logs.length > 0 ? (
            logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">{log.serviceName}</TableCell>
                <TableCell className="font-mono text-xs">{log.requestId}</TableCell>
                <TableCell>
                  <Badge
                    variant={log.status === "success" ? "default" : log.status === "error" ? "destructive" : "outline"}
                  >
                    {log.status}
                  </Badge>
                </TableCell>
                <TableCell>{log.processingTime ? `${log.processingTime}ms` : "-"}</TableCell>
                <TableCell className="text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No recent logs found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

