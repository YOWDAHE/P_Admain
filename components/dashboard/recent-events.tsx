import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, MapPin } from "lucide-react"
import Link from "next/link"

interface RecentEventsProps {
  events: any[]
}

export function RecentEvents({ events }: RecentEventsProps) {
  const isLoading = false

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start space-x-4">
            <Skeleton className="h-12 w-12 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground mb-4">No events found</p>
        <Button asChild>
          <Link href="/dashboard/events/new">Create Event</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="flex items-start space-x-4">
          <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center">
            <Calendar className="h-6 w-6 text-gray-500" />
          </div>
          <div className="space-y-1">
            <h4 className="font-medium">
              <Link href={`/dashboard/events/${event.id}`} className="hover:underline">
                {event.title}
              </Link>
            </h4>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-1 h-3 w-3" />
              <span>{new Date(event.start_time).toLocaleDateString()}</span>
              <span className="mx-1">•</span>
              <MapPin className="mr-1 h-3 w-3" />
              <span>{JSON.parse(event.location).name || "No location"}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
