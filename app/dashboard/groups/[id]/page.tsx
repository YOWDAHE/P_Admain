"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PubNubProvider } from "@/lib/pubnub-context";
import GroupChat from "@/components/dashboard/groups/group-chat";
import { fetchGroupById } from "@/actions/group.action";
import { useAuth } from "@/hooks/use-auth";
import { GroupType } from "@/app/models/Group";

export default function GroupPage() {
	const router = useRouter();
	const { tokens } = useAuth();
	const params = useParams();
	const [group, setGroup] = useState<GroupType | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Parse the ID from URL params
	const idParam = typeof params.id === 'string' ? params.id : '';
	const groupId = parseInt(idParam);

	useEffect(() => {
		async function loadGroup() {
			setIsLoading(true);
			setError(null);

			try {
				if (isNaN(groupId) || groupId <= 0) {
					setError("Invalid group ID");
					setIsLoading(false);
					return;
				}

				if (!tokens?.access) {
					setError("Authentication required. Please log in again.");
					setIsLoading(false);
					return;
				}

                const groupData = await fetchGroupById(groupId, tokens.access);
                console.log("The group: ", groupData);
				setGroup(groupData);
			} catch (err) {
				console.error(`Error fetching group ${groupId}:`, err);
				setError("Failed to load group details. Please try again.");
			} finally {
				setIsLoading(false);
			}
		}

		loadGroup();
	}, [groupId, tokens]);

	if (isLoading) {
		return (
			<div className="flex justify-center items-center h-[calc(100vh-200px)]">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
			</div>
		);
	}

	if (error || !group) {
		return (
			<div className="p-6 bg-red-50 text-red-800 rounded-md">
				<h3 className="text-lg font-medium">Error</h3>
				<p className="mt-2">{error || "Group not found"}</p>
				<Button
					variant="outline"
					className="mt-4"
					onClick={() => router.push("/dashboard/groups")}
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					Back to Groups
				</Button>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-[calc(100vh-80px)]">
			<Tabs defaultValue="chat" className="w-full flex flex-col h-full">
				<TabsList className="mb-4">
					<Button
						variant="outline"
						size="icon"
                        onClick={() => router.push("/dashboard/groups")}
                        className="mr-3 bg-transparent text-black border-0"
					>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<TabsTrigger value="chat">Chat</TabsTrigger>
					<TabsTrigger value="members">Members</TabsTrigger>
					<TabsTrigger value="settings">Settings</TabsTrigger>
				</TabsList>

				<TabsContent value="chat" className="flex-1 flex overflow-hidden">
					<PubNubProvider>
						<GroupChat groupId={group.id} groupName={group.name} />
					</PubNubProvider>
				</TabsContent>

				<TabsContent value="members">
					<Card>
						<CardHeader>
							<CardTitle>Group Members</CardTitle>
						</CardHeader>
						<CardContent className="p-6">
							<div className="flex flex-col items-center justify-center text-gray-500 py-8">
								<Users size={48} className="mb-4 opacity-50" />
								<p className="text-lg mb-1">Coming Soon</p>
								<p className="text-sm">
									Member management will be available in a future update.
								</p>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="settings">
					<Card>
						<CardHeader>
							<CardTitle>Group Settings</CardTitle>
						</CardHeader>
						<CardContent className="p-6">
							<div className="flex flex-col items-center justify-center text-gray-500 py-8">
								<Users size={48} className="mb-4 opacity-50" />
								<p className="text-lg mb-1">Coming Soon</p>
								<p className="text-sm">
									Group settings will be available in a future update.
								</p>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
