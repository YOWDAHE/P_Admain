"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { HelpCircle, MessageSquare, PlusCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function SupportTickets() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createBrowserClient()

  // In a real app, we would fetch tickets from the database
  const tickets: any[] = []
  const isLoading = false

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "default"
      case "in_progress":
        return "secondary"
      case "resolved":
        return "success"
      case "closed":
        return "outline"
      default:
        return "default"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "outline"
      case "medium":
        return "default"
      case "high":
        return "secondary"
      case "urgent":
        return "destructive"
      default:
        return "default"
    }
  }

  if (tickets.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <HelpCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-semibold">No tickets found</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new support ticket.</p>
        <Button className="mt-6" asChild>
          <Link href="/dashboard/support?tab=create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Ticket
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell className="font-medium">{ticket.subject}</TableCell>
              <TableCell>
                <Badge variant={getStatusColor(ticket.status)}>{ticket.status.replace("_", " ")}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
              </TableCell>
              <TableCell>{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
              <TableCell>{new Date(ticket.updated_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/dashboard/support/tickets/${ticket.id}`}>
                    <MessageSquare className="h-4 w-4" />
                    <span className="sr-only">View ticket</span>
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
