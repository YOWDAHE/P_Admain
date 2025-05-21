import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Event App Admin Panel",
  description: "Admin panel for managing events, users, and more",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
			<html lang="en" suppressHydrationWarning className="light">
				<body className={inter.className}>
					<ThemeProvider
						attribute="class"
						defaultTheme="light"
						enableSystem={false}
						forcedTheme="light"
					>
						<AuthProvider>
							{children}
							<Toaster />
						</AuthProvider>
					</ThemeProvider>
				</body>
			</html>
		);
}


import './globals.css'
import { AuthProvider } from "@/hooks/use-auth"
