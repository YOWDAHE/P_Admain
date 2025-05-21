"use client";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { EventForm } from "@/components/dashboard/events/event-form";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton component
import { useEffect, useState, useTransition } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { CategoryCreationResponseType } from "@/app/models/Categories";
import { fetchCategoriesByOrganizer } from "@/actions/category.action";

export default function NewEventPage() {
	const { getAccessToken, user } = useAuth();
	const { toast } = useToast();

	const [categories, setCategories] = useState<CategoryCreationResponseType[]>(
		[]
	);
	const [loading, startLoading] = useTransition();

	useEffect(() => {
		startLoading(() => {
			const fetchCategories = async () => {
				const accessToken = getAccessToken();
				console.log("Access Token: ", accessToken);
				if (!accessToken) {
					toast({
						title: "Error",
						description: "No access token available.",
						variant: "destructive",
					});
					return;
				}

				if (!user || !user.id) {
					toast({
						title: "Error",
						description: "No user or organization ID available.",
						variant: "destructive",
					});
					return;
				}

				try {
					const response = await fetchCategoriesByOrganizer(user.id, accessToken);
					setCategories(response.results);
				} catch (error: any) {
					toast({
						title: "Error",
						description: error.message || "Failed to fetch categories.",
						variant: "destructive",
					});
				}
			};
			fetchCategories();
		});
	}, [getAccessToken, user, toast]);

	return (
		<div className="space-y-6">
			<h1 className="text-3xl font-bold">Create New Event</h1>

			<Card>
				<CardHeader>
					<CardTitle>Event Details</CardTitle>
					<CardDescription>
						Fill in the details below to create a new event.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{loading || !categories ? (
						<div className="space-y-4">
							<Skeleton className="h-8 w-1/2" />
							<Skeleton className="h-6 w-full" />
							<Skeleton className="h-6 w-full" />
							<Skeleton className="h-6 w-1/3" />
						</div>
					) : (
						<EventForm  categories={categories}/>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
