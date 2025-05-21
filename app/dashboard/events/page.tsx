"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { EventsTable } from "@/components/dashboard/events/events-table";
import { getEventById, getEventsByOrganizer } from "@/actions/event.action";
import { useAuth } from "@/hooks/use-auth";
import { EventType } from "@/app/models/Event";

export default function EventsPage() {
	const [event, setEvent] = useState<EventType[] | null>(null);
	const { getAccessToken, user } = useAuth();

	useEffect(() => {
		const fetchEvent = async () => {
			// const accessToken = getAccessToken();
			// console.log("Access Token: ", accessToken);
			// if (!accessToken) {
			// 	console.error("No access token available.");
			// 	return;
			// }

			const result = await getEventsByOrganizer(user!.id);
			if (result.success && result.data) {
				 setEvent(result.data.results);
			} else {
				console.error("Failed to fetch event:", result.message);
			}
		};

		fetchEvent();
	}, [getAccessToken, user?.id]);

	return (
		<div className="space-y-6 overflow-hidden">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">My Events</h1>
				<Button asChild>
					<Link href="/dashboard/events/new">
						<PlusCircle className="mr-2 h-4 w-4" />
						New Event
					</Link>
				</Button>
			</div>

			{event ? <EventsTable events={event} /> : <p>Loading event...</p>}
		</div>
	);
}
