import type { Metadata } from "next"
import { StatsOverview } from "./components/stats-overview"
import { RecentLogsTable } from "./components/recent-logs-table"
import { RequestChart } from "./components/request-chart"
import { TopServicesChart } from "./components/top-services-chart"

export const metadata: Metadata = {
  title: "Admin Dashboard | Microservice Broker",
  description: "Admin dashboard for the microservice broker",
}

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your microservice broker system</p>
      </div>

      <StatsOverview />

      <div className="grid gap-6 md:grid-cols-2">
        <RequestChart />
        <TopServicesChart />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <RecentLogsTable />
      </div>
    </div>
  )
}

