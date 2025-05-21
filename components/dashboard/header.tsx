"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Menu, RefreshCw, User } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface HeaderProps {
	user: any;
}

export function Header() {
	const router = useRouter();
	const { toast } = useToast();
	const { user } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const { updateAccessToken, getAccessToken } = useAuth();

	const handleSignOut = async () => {
		setIsLoading(true);

		try {
			await new Promise((resolve) => setTimeout(resolve, 1000));

			toast({
				title: "Signed out",
				description: "You have been signed out successfully.",
			});
			router.push("/login");
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.message || "Failed to sign out. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleRefreshToken = async () => {
		try {
			// console.log("Refreshing token... ", getAccessToken());
			await updateAccessToken();
			toast({
				title: "Token Refreshed",
				description: "Access token has been refreshed successfully.",
			});
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.message || "Failed to refresh token. Please try again.",
				variant: "destructive",
			});
		}
	};

  return (
			<header className="px-4 py-2 flex items-center justify-between dark:bg-background bg-[#ffffff] border-1 border-b-[#40189d]">
				{/* Mobile menu button */}
				<div className="flex items-center md:hidden">
					<Sheet>
						<SheetTrigger asChild>
							<Button variant="ghost" size="icon">
								<Menu className="h-5 w-5" />
								<span className="sr-only">Toggle menu</span>
							</Button>
						</SheetTrigger>
						<SheetContent side="left" className="p-0">
							<Sidebar />
						</SheetContent>
					</Sheet>
				</div>
				<div className="md:hidden font-bold">Admin</div>
				<div className="flex flex-col items-start flex-shrink-0 px-4">
					<p className="text-xs opacity-50">{user?.email ?? ""}</p>
				</div>
				<div className="flex justify-end items-center gap-4 w-full">
					{/* <Button variant="ghost" size="icon">
						<Bell className="h-5 w-5" />
						<span className="sr-only">Notifications</span>
					</Button> */}

					{/* Refresh Button */}
					{/* <Button variant="ghost" size="icon" onClick={handleRefreshToken}>
						<RefreshCw className="h-5 w-5" />
						<span className="sr-only">Refresh Token</span>
					</Button> */}

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="relative h-8 w-8 rounded-full">
								<Avatar className="h-8 w-8">
									<AvatarImage src="/placeholder-user.jpg" alt={user?.email} />
									<AvatarFallback>
										<User className="h-4 w-4" />
									</AvatarFallback>
								</Avatar>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="">
							<DropdownMenuLabel>
								<div className="flex flex-col space-y-1">
									<p>{user?.email}</p>
									{user?.profile.name && (
										<p className="text-xs text-muted-foreground">{user?.profile.name}</p>
									)}
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
								Profile
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
								Settings
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem onClick={handleSignOut} disabled={isLoading}>
								{isLoading ? "Signing out..." : "Sign out"}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</header>
		);
}
