"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Edit, 
  Heart, 
  MapPin, 
  Star, 
  Users, 
  Users2, 
  BookOpen,
  ExternalLink,
  Hash
} from "lucide-react";
import { format } from "date-fns";
import { getEventById } from "@/actions/event.action";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/use-toast";
import { EventType } from "@/app/models/Event";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { getAccessToken } = useAuth();
  const { toast } = useToast();
  const [event, setEvent] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);
  const eventId = parseInt(Array.isArray(params?.id) ? params.id[0] : params?.id || "", 10);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const accessToken = getAccessToken();
        if (!accessToken) {
          toast({
            title: "Authentication Error",
            description: "Please login again to view event details.",
            variant: "destructive",
          });
          return;
        }

        if (isNaN(eventId)) {
          toast({
            title: "Invalid Event ID",
            description: "The event ID is not valid.",
            variant: "destructive",
          });
          return;
        }

        const response = await getEventById(eventId, accessToken);
        
        if (response.success) {
          setEvent(response.data || null);
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to fetch event details.",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "An unexpected error occurred.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId, getAccessToken, toast]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">Event Not Found</h2>
        <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button onClick={() => router.push("/dashboard/events")}>
          Return to Events
        </Button>
      </div>
    );
  }

  // Parse the location from JSON string
  const locationData = JSON.parse(event.location);

  return (
    <div className="space-y-8">
      {/* Event Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{event.title}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant={event.is_public ? "default" : "outline"}>
              {event.is_public ? "Published" : "Draft"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Created: {format(new Date(event.created_at), "PPP")}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => router.push(`/dashboard/events/${event.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Event
          </Button>
          <Button variant="outline" onClick={() => router.push(`/dashboard/groups/${event.id}`)}>
            <Users2 className="mr-2 h-4 w-4" />
            Go to Groups
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Event Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cover Image */}
          <Card>
            <CardContent className="p-0 overflow-hidden rounded-md">
              <div className="relative aspect-video w-full">
                {event.cover_image_url && event.cover_image_url.length > 0 ? (
                  <img
                    src={event.cover_image_url[0]}
                    alt={event.title}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-muted">
                    <Calendar className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Event Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: event.description 
                }} 
              />
            </CardContent>
          </Card>

          {/* Hashtags */}
          {event.hashtags && event.hashtags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Hash className="mr-2 h-5 w-5" />
                  Hashtags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {event.hashtags.map((hashtag, index) => (
                    <Badge key={index} variant="secondary">{hashtag.name}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Information */}
        <div className="space-y-6">
          {/* Key Event Details */}
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Date</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.start_date), "PPP")}
                    {new Date(event.start_date).toDateString() !== new Date(event.end_date).toDateString() && (
                      <> - {format(new Date(event.end_date), "PPP")}</>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Time</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.start_time), "p")} - {format(new Date(event.end_time), "p")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{locationData.name || "No location set"}</p>
                </div>
              </div>

              {event.organizer && (
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Organizer</p>
                    <p className="text-sm text-muted-foreground">{event.organizer.profile.name}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Event Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Event Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Total Revenue</p>
                  <p className="text-xl font-bold">${event.total_revenue.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">Attendees</p>
                  <p className="text-xl font-bold">{event.attendee_count}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium">Rating</p>
                  <p className="text-sm">
                    {event.average_rating > 0 ? (
                      <span className="text-xl font-bold">{event.average_rating.toFixed(1)} <span className="text-muted-foreground font-normal text-sm">({event.rating_count} reviews)</span></span>
                    ) : (
                      <span className="text-muted-foreground">No ratings yet</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Heart className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium">Likes</p>
                  <p className="text-xl font-bold">{event.likes_count}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <BookOpen className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium">Bookmarks</p>
                  <p className="text-xl font-bold">{event.bookmarks_count}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Map Preview (placeholder) */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative h-[200px] w-full bg-muted rounded-md overflow-hidden">
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors hover:bg-black/30"
                >
                  <Button variant="secondary" size="sm">
                    <MapPin className="mr-2 h-4 w-4" />
                    View on Map
                  </Button>
                </a>
                <img 
                  src={`https://maps.googleapis.com/maps/api/staticmap?center=${event.latitude},${event.longitude}&zoom=14&size=400x200&markers=color:red%7C${event.latitude},${event.longitude}&key=YOUR_API_KEY`} 
                  alt="Event location map" 
                  className="w-full h-full object-cover"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 