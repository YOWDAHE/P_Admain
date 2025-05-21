import type React from "react"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"

// Dummy user data
const dummyUser = {
  id: "1",
  email: "admin@example.com",
  name: "Admin User",
  organization: "Event Management Co.",
  role: "admin",
  avatar_url: null,
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
  }) {
  
  const isLoggedIn = true

  if (!isLoggedIn) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen bg-[#f0f4f5]">
      <Sidebar />
      <div className="flex flex-col flex-1 bg-[#40189d]">
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#f0f4f5]">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
