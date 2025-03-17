"use client"

import { useState, useEffect } from "react"
import { Layers, Key, FileText, CheckCircle, XCircle } from "lucide-react"
import { StatCard } from "./stat-card"
import { Skeleton } from "@/components/ui/skeleton"

interface Stats {
  counts: {
    services: number
    endpoints: number
    requests: number
    successfulRequests: number
    failedRequests: number
    timeoutRequests: number
    apiKeys: number
    activeApiKeys: number
  }
}

export function StatsOverview() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/admin/stats")
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-6">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    )
  }

  if (!stats) {
    return <div>Failed to load statistics</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Total Services"
        value={stats.counts.services}
        icon={<Layers className="h-4 w-4 text-muted-foreground" />}
        description="Registered microservices"
      />
      <StatCard
        title="Total Endpoints"
        value={stats.counts.endpoints}
        icon={<FileText className="h-4 w-4 text-muted-foreground" />}
        description="Available service endpoints"
      />
      <StatCard
        title="API Keys"
        value={`${stats.counts.activeApiKeys} / ${stats.counts.apiKeys}`}
        icon={<Key className="h-4 w-4 text-muted-foreground" />}
        description="Active / Total API keys"
      />
      <StatCard
        title="Total Requests"
        value={stats.counts.requests}
        icon={<FileText className="h-4 w-4 text-muted-foreground" />}
        description="All-time request count"
      />
      <StatCard
        title="Successful Requests"
        value={stats.counts.successfulRequests}
        icon={<CheckCircle className="h-4 w-4 text-emerald-500" />}
        description={`${((stats.counts.successfulRequests / stats.counts.requests) * 100 || 0).toFixed(1)}% success rate`}
      />
      <StatCard
        title="Failed Requests"
        value={stats.counts.failedRequests + stats.counts.timeoutRequests}
        icon={<XCircle className="h-4 w-4 text-rose-500" />}
        description={`${(((stats.counts.failedRequests + stats.counts.timeoutRequests) / stats.counts.requests) * 100 || 0).toFixed(1)}% failure rate`}
      />
    </div>
  )
}

