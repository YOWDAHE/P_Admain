import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { SupportTickets } from "@/components/dashboard/support/support-tickets"
import { CreateTicket } from "@/components/dashboard/support/create-ticket"
import { Faq } from "@/components/dashboard/support/faq"

export default async function SupportPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Support</h1>

      <Tabs defaultValue="tickets">
        <TabsList>
          <TabsTrigger value="tickets">My Tickets</TabsTrigger>
          <TabsTrigger value="create">Create Ticket</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets">
          <Card>
            <CardHeader>
              <CardTitle>Support Tickets</CardTitle>
              <CardDescription>View and manage your support tickets.</CardDescription>
            </CardHeader>
            <CardContent>
              <SupportTickets />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create Support Ticket</CardTitle>
              <CardDescription>Submit a new support ticket.</CardDescription>
            </CardHeader>
            <CardContent>
              <CreateTicket />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Find answers to common questions.</CardDescription>
            </CardHeader>
            <CardContent>
              <Faq />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
