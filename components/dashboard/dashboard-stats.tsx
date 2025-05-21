import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Calendar, CreditCard, Users } from "lucide-react"

interface DashboardStatsProps {
  stats: {
    totalEvents: number
    totalUsers: number
    totalTickets: number
    totalRevenue: number
  }
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card className="bg-white">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Events</CardTitle>
						<Calendar className="h-4 w-4" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalEvents}</div>
						<p className="text-xs">
							Events created on the platform
						</p>
					</CardContent>
				</Card>

				<Card className="bg-white">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Users</CardTitle>
						<BarChart3 className="h-4 w-4" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalUsers}</div>
						<p className="text-xs">
							Tickets users across all events
						</p>
					</CardContent>
				</Card>

				<Card className="bg-white">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
						<CreditCard className="h-4 w-4" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">Birr {stats.totalRevenue.toFixed(2)}</div>
						<p className="text-xs">
							Revenue generated from ticket sales
						</p>
					</CardContent>
				</Card>
			</div>
		);
}
