"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
	BarChart3,
	Calendar,
	CreditCard,
	Flag,
	Group,
	HelpCircle,
	Home,
	MapPin,
	Settings,
	Tag,
	Users,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const sidebarLinks = [
  { name: "", href: "#", icon: Home },
  { 
    name: "Dashboard", 
    href: "/dashboard", 
    icon: Home,
    exact: true // Requires exact match
  },
  { 
    name: "Events", 
    href: "/dashboard/events", 
    icon: Calendar,
    exact: false // Allows nested routes
  },
  { 
    name: "Categories", 
    href: "/dashboard/categories", 
    icon: Tag,
    exact: false
  },
  { 
    name: "Analytics", 
    href: "/dashboard/analytics", 
    icon: BarChart3,
    exact: true 
  },
  { 
    name: "Groups", 
    href: "/dashboard/groups", 
    icon: Users,
    exact: true 
  },
  { 
    name: "Settings", 
    href: "/dashboard/settings", 
    icon: Settings,
    exact: true 
  },
];

export function Sidebar() {
	const pathname = usePathname();
	const { user } = useAuth();

	return (
		<div className="hidden md:flex md:w-64 md:flex-col bg-[#40189d] text-white">
			<div className="flex flex-col flex-grow pt-5 overflow-y-auto">
				<div className="flex flex-row items-center gap-3 flex-shrink-0 px-4 mb-4">
					<Avatar className="h-10 w-10 border-2 border-white">
						<AvatarImage src={user?.profile.logo_url} alt={user?.profile.name || "Organization"} />
						<AvatarFallback className="bg-primary text-primary-foreground">
							{user?.profile.name?.substring(0, 2).toUpperCase() || "OR"}
						</AvatarFallback>
					</Avatar>
					<div>
						<h1 className="text-xl font-bold">{user?.profile.name ?? ""} Admin</h1>
					</div>
				</div>
				<div className="flex-1 flex flex-col">
					<nav className="flex-1 px-2 pb-4">
						{sidebarLinks.map((link) => {
							const Icon = link.icon;
              const isExactMatch = pathname === link.href;
              const isNestedMatch = pathname.startsWith(link.href + "/");
              const isSelected = link.exact
															? isExactMatch
															: isExactMatch || isNestedMatch;

							return (
								<div
									key={link.name}
									className={cn("mb-1")}
								>
									{link.name == "" ? (
										<div
											className={cn(
												"group flex items-center px-4 py-3 text-sm font-medium",
												isSelected
													? "bg-[#f0f4f5] text-[#40189d]"
													: "text-white hover:bg-[#5a3ab0]"
											)}
										></div>
									) : (
										<Link
											key={link.name}
											href={link.href}
											className={cn(
												"group flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200",
												isSelected
													? "bg-[#f0f4f5] text-[#40189d]"
													: "text-white hover:bg-[#5a3ab0]"
											)}
										>
											<Icon className="mr-3 h-5 w-5" />
											{link.name}
										</Link>
									)}
								</div>
							);
						})}
					</nav>
				</div>
			</div>
		</div>
	);
}
