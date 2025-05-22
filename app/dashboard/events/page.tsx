"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Info, PlusCircle } from "lucide-react";
import Link from "next/link";
import { EventsTable } from "@/components/dashboard/events/events-table";
import { getEventById, getEventsByOrganizer } from "@/actions/event.action";
import { useAuth } from "@/hooks/use-auth";
import { EventType } from "@/app/models/Event";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { VerificationAlert } from "@/components/dashboard/verification-alert";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function EventsPage() {
	const [events, setEvents] = useState<EventType[] | null>(null);
	const { getAccessToken, user } = useAuth();
	const [loading, setLoading] = useState(true);

	// Check if the user is verified
	const isVerified = user?.profile?.verification_status === "approved";

	useEffect(() => {
		const fetchEvents = async () => {
			if (!user || !user.id) {
				setLoading(false);
				return;
			}

			try {
				const result = await getEventsByOrganizer(user.id);
				if (result.success && result.data) {
					setEvents(result.data.results);
				} else {
					console.error("Failed to fetch events:", result.message);
				}
			} catch (error) {
				console.error("Error fetching events:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchEvents();
	}, [user]);

	return (
		<div className="space-y-6 overflow-hidden">
			{/* Verification Alert */}
			{user?.profile && !isVerified && (
				<div className="mb-6 p-4 border border-yellow-200 bg-yellow-50 rounded-md">
					<div className="flex items-start">
						<Info className="h-5 w-5 text-yellow-500 mt-0.5 mr-3" />
						<div>
							<h3 className="font-medium text-yellow-800">
								Account Verification Required
							</h3>
							<p className="text-sm text-yellow-700 mt-1">
								Your account is not verified yet. To create events, please complete the
								verification process in your
								<a href="/dashboard/settings" className="text-blue-600 underline ml-1">
									account settings
								</a>
								.
							</p>
						</div>
					</div>
				</div>
			)}

			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">My Events</h1>

				{isVerified ? (
					<Button asChild>
						<Link href="/dashboard/events/new">
							<PlusCircle className="mr-2 h-4 w-4" />
							Create New Event
						</Link>
					</Button>
				) : (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<div>
									<Button disabled className="cursor-not-allowed opacity-60">
										<PlusCircle className="mr-2 h-4 w-4" />
										Create New Event
									</Button>
								</div>
							</TooltipTrigger>
							<TooltipContent className="max-w-xs p-3">
								<p>
									Your account must be verified before you can create events. Please
									complete verification in your account settings.
								</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				)}
			</div>

			{/* No events notification with verification guidance */}
			{!loading && events && events.length === 0 && !isVerified && (
				<Alert className="bg-blue-50 border-blue-200">
					<Info className="h-5 w-5 text-blue-500" />
					<AlertTitle>No Events Found</AlertTitle>
					<AlertDescription>
						<p className="mb-2">You haven't created any events yet.</p>
						<p className="text-sm">
							Please complete the verification process in your{" "}
							<Link
								href="/dashboard/settings"
								className="text-blue-600 hover:underline"
							>
								account settings
							</Link>{" "}
							to start creating events.
						</p>
					</AlertDescription>
				</Alert>
			)}

			{loading ? (
				<div className="space-y-4">
					<div className="h-8 w-full bg-gray-200 animate-pulse rounded"></div>
					<div className="h-8 w-full bg-gray-200 animate-pulse rounded"></div>
					<div className="h-8 w-full bg-gray-200 animate-pulse rounded"></div>
				</div>
			) : events && events.length > 0 ? (
				<EventsTable events={events} />
			) : isVerified ? (
				<p>No events found. Create your first event!</p>
			) : null}
		</div>
	);
}
