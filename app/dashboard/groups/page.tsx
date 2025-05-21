"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GroupsTable } from "@/components/dashboard/groups/groups-table";
import { fetchGroups } from "@/actions/group.action";
import { cookies } from "next/headers";
import { Plus, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { GroupType } from "@/app/models/Group";

function GroupsTableSkeleton() {
	return (
		<div className="space-y-4">
			<div className="h-8 w-1/3 rounded-md bg-gray-200 animate-pulse"></div>
			<div className="h-96 rounded-md bg-gray-200 animate-pulse"></div>
		</div>
	);
}

export default function GroupsPage() {
	const { tokens } = useAuth();
	const [groups, setGroups] = useState<GroupType[]>([]);

	async function getGroups() {
		try {
			if (!tokens) {
				console.error("No access token available in cookies");
				return [];
			}

			try {
				const groupsData = await fetchGroups(tokens.access);
				setGroups(groupsData.results);
			} catch (parseError) {
				console.error("Error parsing tokens from cookies:", parseError);
				return [];
			}
		} catch (error) {
			console.error("Error fetching groups:", error);
			return [];
		}
	}
	useEffect(() => {
		getGroups();
	},[]);
	// const groups = await getGroups();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Groups</h1>
					<p className="text-muted-foreground">
						Manage your organization's groups and members.
					</p>
				</div>
				<Button asChild>
					<Link href="/dashboard/groups/new">
						<Plus className="mr-2 h-4 w-4" />
						New Group
					</Link>
				</Button>
      </div>

			<Suspense fallback={<GroupsTableSkeleton />}>
				<GroupsTable groups={groups} />
			</Suspense>
    </div>
	);
}
