import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { UsersTable } from "@/components/dashboard/users/users-table"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export default async function UsersPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // In a real app, we would fetch users from the database
  const users: any[] = []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users</h1>
        <Button asChild>
          <Link href="/dashboard/users/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New User
          </Link>
        </Button>
      </div>

      <UsersTable users={users} />
    </div>
  )
}
