"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EventEditForm } from "@/components/dashboard/events/event-edit-form";
import { useEffect, useState, useTransition } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { fetchCategoriesByOrganizer } from "@/actions/category.action";
import { getEventById } from "@/actions/event.action";
import { CategoryCreationResponseType } from "@/app/models/Categories";
import { EventType } from "@/app/models/Event";
import { useParams } from "next/navigation";

export default function EventPage() {
    const { getAccessToken, user } = useAuth();
    const { toast } = useToast();
    const params = useParams();
    const eventId = parseInt(Array.isArray(params?.id) ? params.id[0] : params?.id || "", 10);

    const [categories, setCategories] = useState<CategoryCreationResponseType[]>(
        []
    );
    const [event, setEvent] = useState<EventType | null>(null);
    const [loading, startLoading] = useTransition();

    useEffect(() => {
        startLoading(() => {
            const fetchData = async () => {
                const accessToken = getAccessToken();
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

                if (isNaN(eventId)) {
                    toast({
                        title: "Error",
                        description: "Invalid event ID.",
                        variant: "destructive",
                    });
                    return;
                }

                try {
                    const categoryResponse = await fetchCategoriesByOrganizer(
                        user.id,
                        accessToken
                    );
                    setCategories(categoryResponse.results);

                    const eventResponse = await getEventById(eventId, accessToken);
                    setEvent(eventResponse.data || null);
                } catch (error: any) {
                    toast({
                        title: "Error",
                        description:
                            error.message || "Failed to fetch event or categories.",
                        variant: "destructive",
                    });
                }
            };
            fetchData();
        });
    }, [getAccessToken, user, eventId, toast]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Event Details</CardTitle>
                    <CardDescription>
                        Update the details below to edit the event.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading || !categories || !event ? (
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-1/2" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-1/3" />
                        </div>
                    ) : (
                        <EventEditForm event={event} categories={categories} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
