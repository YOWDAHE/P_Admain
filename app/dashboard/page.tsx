"use client";
import { useState, useEffect } from "react";
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
import { AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AnalyticsChart } from "@/components/dashboard/analytics/analytics-chart";
import { VerificationAlert } from "@/components/dashboard/verification-alert";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
	const { user, tokens, logout } = useAuth();
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
	const [events, setEvents] = useState<any[]>([]);
	const [isAnalyticsVerificationError, setIsAnalyticsVerificationError] =
		useState(false);

	useEffect(() => {
		async function fetchDashboardData() {
			setLoading(true);
			setError(null);

			try {
				if (!user || !user.id) {
					logout();
					setError("Authentication required");
					setLoading(false);
					return;
				}

				const analyticsResponse = await fetchOrganizationAnalytics(user.id);

				if (analyticsResponse.success && analyticsResponse.data) {
					setAnalyticsData(analyticsResponse.data);
				} else if (analyticsResponse.isVerificationError) {
					setIsAnalyticsVerificationError(true);
				} else if (analyticsResponse.error) {
					console.error("Analytics error:", analyticsResponse.error);
				}

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

	// Calculate stats from analytics data or use zeros as defaults
	const stats = {
		totalEvents: analyticsData?.events?.total || 0,
		totalUsers: analyticsData?.users?.total || 0,
		totalTickets: 0, // Currently not provided by the API
		totalRevenue: analyticsData?.revenue?.total || 0,
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

			{/* Verification Status Alert */}
			{user?.profile && (
				<VerificationAlert verificationStatus={user.profile.verification_status} />
			)}

			{/* Show analytics verification error if present */}
			{isAnalyticsVerificationError && (
				<Alert className="border-yellow-500 bg-yellow-50">
					<Info className="h-5 w-5 text-yellow-500" />
					<AlertTitle>Analytics Not Available</AlertTitle>
					<AlertDescription>
						<p className="mb-4">
							Analytics are only available for non verified organizations. Complete the
							verification process to access detailed analytics for your events.
						</p>
						<Button
							variant="outline"
							onClick={() => router.push("/dashboard/settings")}
							className="bg-white hover:bg-yellow-100 border-yellow-400 text-yellow-700"
						>
							Go to Settings to Verify
						</Button>
					</AlertDescription>
				</Alert>
			)}

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
							<AnalyticsChart type="events" data={analyticsData.event_growth} />
						) : (
							<div className="text-center p-6 text-muted-foreground">
								<p>No analytics data available.</p>
								{isAnalyticsVerificationError && (
									<p className="text-sm mt-2 text-yellow-600">
										Analytics will be enabled after verification.
									</p>
								)}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
