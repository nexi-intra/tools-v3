import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatCardProps {
  title: string
  value: string | number
  icon: ReactNode
  description?: string
  trend?: {
    value: number
    label: string
  }
}

export function StatCard({ title, value, icon, description, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {trend && (
          <div className="mt-2 flex items-center text-xs">
            <span
              className={
                trend.value > 0 ? "text-emerald-500" : trend.value < 0 ? "text-rose-500" : "text-muted-foreground"
              }
            >
              {trend.value > 0 ? "+" : ""}
              {trend.value}%
            </span>
            <span className="ml-1 text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

