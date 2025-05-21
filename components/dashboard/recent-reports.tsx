import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Eye, Flag } from "lucide-react"
import Link from "next/link"

interface RecentReportsProps {
  reports: any[]
}

export function RecentReports({ reports }: RecentReportsProps) {
  const isLoading = false

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      case "investigating":
        return <Badge variant="secondary">Investigating</Badge>
      case "resolved":
        return <Badge variant="default">Resolved</Badge>
      case "dismissed":
        return <Badge variant="destructive">Dismissed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start space-x-4">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground mb-4">No reports found</p>
        <Button asChild>
          <Link href="/dashboard/reports">View All Reports</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <div key={report.id} className="flex items-start space-x-4">
          <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
            <Flag className="h-5 w-5 text-gray-500" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Report on {report.event_title}</h4>
              {getStatusBadge(report.status)}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">{report.content}</p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Reported user: {report.reported_user}</span>
              <Button size="sm" variant="ghost" asChild>
                <Link href={`/dashboard/reports`} className="flex items-center">
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ))}
      <div className="pt-2">
        <Button variant="outline" asChild className="w-full">
          <Link href="/dashboard/reports">View All Reports</Link>
        </Button>
      </div>
    </div>
  )
}
