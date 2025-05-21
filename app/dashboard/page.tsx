'use client';
import { useState, useEffect } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentEvents } from "@/components/dashboard/recent-events";
import { useAuth } from "@/hooks/use-auth";
import { fetchOrganizationAnalytics } from "@/actions/analytics.action";
import { getEventsByOrganizer } from "@/actions/event.action";
import { AnalyticsData } from "@/app/models/analytics";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AnalyticsChart } from "@/components/dashboard/analytics/analytics-chart";

export default function DashboardPage() {
	const { user, tokens } = useAuth();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
	const [events, setEvents] = useState<any[]>([]);

	useEffect(() => {
		async function fetchDashboardData() {
			setLoading(true);
			setError(null);

			try {
				// Only proceed if we have a logged-in user
				if (!user || !user.id) {
					setError("Authentication required");
					setLoading(false);
					return;
				}

				// Fetch analytics data
				const analytics = await fetchOrganizationAnalytics(user.id);
				setAnalyticsData(analytics);

				// Fetch recent events
				const eventsResponse = await getEventsByOrganizer(user.id);
				if (eventsResponse.success && eventsResponse.data) {
					// Get the most recent 5 events
					const recentEvents = eventsResponse.data.results.slice(0, 5);
					setEvents(recentEvents);
				} else {
					console.error("Failed to fetch events:", eventsResponse.message);
				}
			} catch (err) {
				console.error("Error fetching dashboard data:", err);
				setError("Failed to load dashboard data. Please try again later.");
			} finally {
				setLoading(false);
			}
		}

		fetchDashboardData();
	}, [user]);

	// Calculate stats from analytics data
	const stats = {
		totalEvents: analyticsData?.events.total || 0,
		totalUsers: analyticsData?.users.total || 0,
		totalTickets: 0, // Currently not provided by the API
		totalRevenue: analyticsData?.revenue.total || 0,
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-[calc(100vh-200px)]">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
			</div>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive" className="mb-6">
				<AlertCircle className="h-4 w-4" />
				<AlertTitle>Error</AlertTitle>
				<AlertDescription>{error}</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="space-y-6 overflow-hidden">
			<h1 className="text-3xl font-bold">Dashboard</h1>

			<DashboardStats stats={stats} />

			<div className="grid gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Recent Events</CardTitle>
						<CardDescription>Your latest events</CardDescription>
					</CardHeader>
					<CardContent>
						{events.length > 0 ? (
							<RecentEvents events={events} />
						) : (
							<div className="text-center p-6 text-muted-foreground">
								<p>No events found.</p>
								<p className="text-sm mt-2">Create your first event to get started!</p>
							</div>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Event Growth</CardTitle>
						<CardDescription>Number of events created over time</CardDescription>
					</CardHeader>
					<CardContent>
						{analyticsData ? (
							<AnalyticsChart 
								type="events" 
								data={analyticsData.event_growth} 
							/>
						) : (
							<div className="text-center p-6 text-muted-foreground">
								<p>No analytics data available.</p>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
