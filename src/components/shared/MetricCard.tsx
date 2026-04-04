import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  trend?: number
  trendLabel?: string
  icon: React.ReactNode
  iconBgColor?: string
}

export function MetricCard({ title, value, trend, trendLabel, icon, iconBgColor = "bg-primary/10 text-primary" }: MetricCardProps) {
  return (
    <Card className="hover:shadow-md transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBgColor}`}>
            {icon}
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full ${trend >= 0 ? "text-success bg-success/10" : "text-error bg-error/10"}`}>
              {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-text-secondary mb-1">{title}</h3>
          <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
          {trendLabel && <p className="text-xs text-text-muted mt-1">{trendLabel}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
