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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function NewEventPage() {
	const { getAccessToken, user } = useAuth();
	const { toast } = useToast();
	const router = useRouter();

	// Check if the user is verified
	const isVerified = user?.profile?.verification_status === "approved";

	const [categories, setCategories] = useState<CategoryCreationResponseType[]>(
		[]
	);
	const [loading, startLoading] = useTransition();

	// Redirect unverified users back to the events page
	useEffect(() => {
		if (user && !isVerified) {
			toast({
				title: "Verification Required",
				description: "Your account must be verified before you can create events.",
				variant: "destructive",
			});
			router.push("/dashboard/events");
		}
	}, [user, isVerified, router, toast]);

	useEffect(() => {
		if (!isVerified) {
			return; // Skip data fetching for unverified users
		}

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
	}, [getAccessToken, user, toast, isVerified]);

	// If user is not verified, show verification required message
	if (!isVerified) {
		return (
			<div className="space-y-6">
				<h1 className="text-3xl font-bold">Create New Event</h1>
				
				<Alert variant="destructive">
					<ShieldAlert className="h-5 w-5" />
					<AlertTitle>Verification Required</AlertTitle>
					<AlertDescription>
						<p className="mb-3">Your account must be verified before you can create events.</p>
						<p className="mb-4">Please complete the verification process in your account settings.</p>
						<Button onClick={() => router.push("/dashboard/events")}>
							Return to Events
						</Button>
					</AlertDescription>
				</Alert>
			</div>
		);
	}

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
