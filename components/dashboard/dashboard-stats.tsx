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
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				<Card className="bg-white">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-indigo-600">Total Events</CardTitle>
						<div className="p-2 bg-indigo-100 rounded-full">
							<Calendar className="h-4 w-4 text-indigo-600" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-indigo-900">{stats.totalEvents}</div>
						<p className="text-xs text-indigo-500">
							Events created on the platform
						</p>
					</CardContent>
				</Card>

				<Card className="bg-white">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-emerald-600">Total Users</CardTitle>
						<div className="p-2 bg-emerald-100 rounded-full">
							<Users className="h-4 w-4 text-emerald-600" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-emerald-900">{stats.totalUsers}</div>
						<p className="text-xs text-emerald-500">
							Tickets users across all events
						</p>
					</CardContent>
				</Card>

				<Card className="bg-white">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium text-red-600">Total Revenue</CardTitle>
						<div className="p-2 bg-red-100 rounded-full">
							<CreditCard className="h-4 w-4 text-red-600" />
						</div>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-red-900">Birr {stats.totalRevenue.toFixed(2)}</div>
						<p className="text-xs text-red-500">
							Revenue generated from ticket sales
						</p>
					</CardContent>
				</Card>
			</div>
		);
}
