"use client";

import { useState, useRef, useEffect } from "react";
import { SendHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePubNub } from "@/lib/pubnub-context";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

// Define the message structure that will be sent/received through PubNub
interface MessageContent {
	text: string;
	createdAt: number;
	user: {
		_id: string;
		name: string;
	};
}

// Define the structure for our internal message state
interface Message {
	id: string;
	text: string;
	user: {
		_id: string;
		name: string;
	};
	createdAt: number;
	channel: string;
}

interface GroupChatProps {
	groupId: number;
	groupName: string;
}

export default function GroupChat({ groupId, groupName }: GroupChatProps) {
	const [messageInput, setMessageInput] = useState("");
	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const { pubnub, isReady, setCurrentChannel } = usePubNub();
	const { user } = useAuth();
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const channelId = `${groupId}`;

	// Set current channel when component mounts
	useEffect(() => {
		setCurrentChannel(channelId);
	}, [channelId, setCurrentChannel]);

	// Scroll to bottom when messages update
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// Load message history and subscribe to new messages
	useEffect(() => {
		if (!isReady || !pubnub) return;

		setIsLoading(true);

		// Fetch message history
		pubnub.fetchMessages(
			{
				channels: [channelId],
				count: 50,
			},
			(status, response) => {
				if (!response || !response.channels || !response.channels[channelId]) {
					setIsLoading(false);
					return;
				}

				try {
					const fetchedMessages: Message[] = response.channels[channelId].map(
						(msg) => {
							// Handle PubNub message data safely
							const messageData =
								typeof msg.message === "object"
									? msg.message
									: {
											text: "Message format error",
											user: { _id: "0", name: "System" },
											createdAt: Date.now(),
									  };

							return {
								id: String(msg.timetoken),
								text: (messageData as any).text || "No content",
								user: (messageData as any).user || { _id: "0", name: "Unknown" },
								createdAt: parseInt(String(msg.timetoken)) / 10000,
								channel: channelId,
							};
						}
					);

					setMessages(fetchedMessages);
				} catch (error) {
					console.error("Error parsing message history:", error);
				} finally {
					setIsLoading(false);
				}
			}
		);

		const listener = {
			message: (event: any) => {
				if (event.channel === channelId) {
					try {
						const messageData =
							typeof event.message === "object"
								? event.message
								: {
										text: "Message format error",
										user: { _id: "0", name: "System" },
										createdAt: Date.now(),
								  };

						const newMessage: Message = {
							id: String(event.timetoken),
							text: (messageData as any).text || "No content",
							user: (messageData as any).user || { _id: "0", name: "Unknown" },
							createdAt: parseInt(String(event.timetoken)) / 10000,
							channel: event.channel,
						};

						setMessages((prevMessages) => [...prevMessages, newMessage]);
					} catch (error) {
						console.error("Error parsing new message:", error);
					}
				}
			},
		};

		pubnub.addListener(listener);

		return () => {
			pubnub.removeListener(listener);
		};
	}, [pubnub, isReady, channelId]);

	const handleSendMessage = (e: React.FormEvent) => {
		e.preventDefault();

		if (!messageInput.trim() || !isReady || !pubnub || !user) return;

		const message = {
			text: messageInput.trim(),
			createdAt: Date.now(),
			user: {
				_id: user.id.toString(),
				name: user.profile.name || "Organization",
			},
		};

		pubnub.publish(
			{
				channel: channelId,
				message,
			},
			() => {
				setMessageInput("");
			}
		);
	};

	const formatTime = (timestamp: number) => {
		const date = new Date(timestamp);
		return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	};

	const isCurrentUser = (userId: string) => {
		return user?.id.toString() === userId;
	};

	return (
		<Card className="w-full flex-1 flex flex-col overflow-hidden">
			<CardHeader className="border-b py-3 shrink-0">
				<CardTitle>{groupName} Chat</CardTitle>
			</CardHeader>
			<CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
				<div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-primary/20 hover:scrollbar-thumb-primary/40 scrollbar-track-transparent">
					{isLoading ? (
						<div className="space-y-4">
							{[...Array(5)].map((_, i) => (
								<div key={i} className="flex items-start gap-2">
									<Skeleton className="h-10 w-10 rounded-full" />
									<div className="space-y-2">
										<Skeleton className="h-4 w-[250px]" />
										<Skeleton className="h-20 w-[300px] rounded-md" />
									</div>
								</div>
							))}
						</div>
					) : messages.length === 0 ? (
						<div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
							<p className="mb-1 text-center">No messages yet</p>
							<p className="text-sm text-center">
								Be the first to send a message in this group!
							</p>
						</div>
					) : (
						<>
							<div className="space-y-4">
								{messages.map((message) => (
									<div
										key={message.id}
										className={`flex ${
											isCurrentUser(message.user._id) ? "justify-end" : "justify-start"
										}`}
									>
										<div
											className={`max-w-[80%] rounded-lg p-3 ${
												isCurrentUser(message.user._id)
													? "bg-primary text-primary-foreground"
													: "bg-muted"
											}`}
										>
											{!isCurrentUser(message.user._id) && (
												<div className="font-semibold text-sm mb-1">
													{message.user.name}
												</div>
											)}
											<div className="break-words">{message.text}</div>
											<div
												className={`text-xs mt-1 text-right ${
													isCurrentUser(message.user._id)
														? "text-primary-foreground/70"
														: "text-muted-foreground"
												}`}
											>
												{formatTime(message.createdAt)}
											</div>
										</div>
									</div>
								))}
							</div>
							<div ref={messagesEndRef} />
						</>
					)}
				</div>

				<form
					onSubmit={handleSendMessage}
					className="border-t p-4 flex items-center gap-2 bg-background shrink-0"
				>
					<Input
						value={messageInput}
						onChange={(e) => setMessageInput(e.target.value)}
						placeholder="Type your message..."
						className="flex-1"
						disabled={!isReady || isLoading}
					/>
					<Button
						type="submit"
						size="icon"
						disabled={!messageInput.trim() || !isReady || isLoading}
					>
						<SendHorizontal className="h-5 w-5" />
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
