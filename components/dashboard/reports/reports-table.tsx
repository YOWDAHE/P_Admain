"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Eye, Flag, MessageSquare, User } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface ReportsTableProps {
  reports: any[]
}

export function ReportsTable({ reports }: ReportsTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<any | null>(null)
  const [newStatus, setNewStatus] = useState<string>("")
  const [adminNotes, setAdminNotes] = useState<string>("")

  const handleViewReport = (report: any) => {
    setSelectedReport(report)
    setNewStatus(report.status)
    setAdminNotes("")
    setIsReportDialogOpen(true)
  }

  const handleUpdateReport = async () => {
    try {
      // In a real app, we would update the report in the database
      // For now, just show a success message

      await new Promise((resolve) => setTimeout(resolve, 500))

      toast({
        title: "Report updated",
        description: "The report status has been updated successfully.",
      })

      setIsReportDialogOpen(false)
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update report. Please try again.",
        variant: "destructive",
      })
    }
  }

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

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case "comment":
        return <MessageSquare className="h-4 w-4 mr-2" />
      case "post":
        return <Flag className="h-4 w-4 mr-2" />
      case "user":
        return <User className="h-4 w-4 mr-2" />
      default:
        return <Flag className="h-4 w-4 mr-2" />
    }
  }

  if (reports.length === 0) {
    return (
      <div className="rounded-md border border-border p-8 text-center bg-card">
        <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-lg font-semibold">No reports found</h3>
        <p className="mt-1 text-sm text-muted-foreground">There are no user reports to review at this time.</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border border-border overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Reported User</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reported On</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell>
                  <div className="flex items-center">
                    {getReportTypeIcon(report.report_type)}
                    <span className="capitalize">{report.report_type}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">{report.content}</TableCell>
                <TableCell>{report.reported_user}</TableCell>
                <TableCell>{report.event_title || "N/A"}</TableCell>
                <TableCell>{getStatusBadge(report.status)}</TableCell>
                <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => handleViewReport(report)}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View report</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        {selectedReport && (
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Report Details</DialogTitle>
              <DialogDescription>View and update the status of this report.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h4 className="font-medium">Report Type</h4>
                <p className="flex items-center text-muted-foreground">
                  {getReportTypeIcon(selectedReport.report_type)}
                  <span className="capitalize">{selectedReport.report_type}</span>
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Content</h4>
                <p className="text-muted-foreground">{selectedReport.content}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Reported By</h4>
                  <p className="text-muted-foreground">{selectedReport.reported_by}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Reported User</h4>
                  <p className="text-muted-foreground">{selectedReport.reported_user}</p>
                </div>
              </div>

              {selectedReport.event_title && (
                <div className="space-y-2">
                  <h4 className="font-medium">Event</h4>
                  <p className="text-muted-foreground">{selectedReport.event_title}</p>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-medium">Current Status</h4>
                <div>{getStatusBadge(selectedReport.status)}</div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Update Status</h4>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Admin Notes</h4>
                <Textarea
                  placeholder="Add notes about this report"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsReportDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleUpdateReport}>
                Update Report
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}
