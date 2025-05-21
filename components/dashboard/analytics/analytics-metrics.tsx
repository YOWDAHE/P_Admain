'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDown, ArrowUp, BarChart3, Calendar, CreditCard, Users } from "lucide-react"
import { AnalyticsData } from "@/app/models/analytics"

interface AnalyticsMetricsProps {
  data: AnalyticsData;
}

export function AnalyticsMetrics({ data }: AnalyticsMetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.events.total}</div>
          <div className="flex items-center text-xs">
            {data.events.percentage_change > 0 ? (
              <>
                <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                <span className="text-green-500">{data.events.percentage_change}% increase</span>
              </>
            ) : (
              <>
                <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
                <span className="text-red-500">{Math.abs(data.events.percentage_change)}% decrease</span>
              </>
            )}
            <span className="ml-1 text-muted-foreground">from last month</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.users.total}</div>
          <div className="flex items-center text-xs">
            {data.users.percentage_change > 0 ? (
              <>
                <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                <span className="text-green-500">{data.users.percentage_change}% increase</span>
              </>
            ) : (
              <>
                <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
                <span className="text-red-500">{Math.abs(data.users.percentage_change)}% decrease</span>
              </>
            )}
            <span className="ml-1 text-muted-foreground">from last month</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Birr {data.revenue.total.toLocaleString()}</div>
          <div className="flex items-center text-xs">
            {data.revenue.percentage_change > 0 ? (
              <>
                <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
                <span className="text-green-500">{data.revenue.percentage_change}% increase</span>
              </>
            ) : (
              <>
                <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
                <span className="text-red-500">{Math.abs(data.revenue.percentage_change)}% decrease</span>
              </>
            )}
            <span className="ml-1 text-muted-foreground">from last month</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
