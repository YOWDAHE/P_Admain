"use client";

import { useState, useRef, useEffect } from "react";
import { SendHorizontal, Image as ImageIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePubNub } from "@/lib/pubnub-context";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

// Define the message structure that will be sent/received through PubNub
interface MessageContent {
	text: string;
	createdAt: number;
	image?: string;
	user: {
		_id: string;
		name: string;
	};
}

// Define the structure for our internal message state
interface Message {
	id: string;
	text: string;
	image?: string;
	user: {
		_id: string;
		name: string;
	};
	createdAt: number;
	channel: string;
	pending?: boolean;
}

interface GroupChatProps {
	groupId: number;
	groupName: string;
}

export default function GroupChat({ groupId, groupName }: GroupChatProps) {
	const [messageInput, setMessageInput] = useState("");
	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isUploading, setIsUploading] = useState(false);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
	const [isImageLoading, setIsImageLoading] = useState(false);
	
	const { pubnub, isReady, setCurrentChannel } = usePubNub();
	const { user } = useAuth();
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
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
								text: (messageData as any).text || "",
								image: (messageData as any).image || undefined,
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
							text: (messageData as any).text || "",
							image: (messageData as any).image || undefined,
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

		if ((!messageInput.trim() && !isUploading) || !isReady || !pubnub || !user) return;

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

	const handleImageClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file || !user) return;

		// Create temporary message with local image
		const tempId = `temp-${Date.now()}`;
		const tempMessage: Message = {
			id: tempId,
			text: "",
			user: {
				_id: user.id.toString(),
				name: user.profile.name || "Organization",
			},
			createdAt: Date.now(),
			channel: channelId,
			pending: true,
		};

		setIsUploading(true);

		try {
			// Read the file as a data URL for preview
			const reader = new FileReader();
			reader.onload = async (event) => {
				if (event.target?.result) {
					// Update temp message with local preview
					tempMessage.image = event.target.result as string;
					setMessages((prevMessages) => [...prevMessages, tempMessage]);

					// Upload to Cloudinary
					try {
						const cloudinaryUrl = await uploadToCloudinary(file);
						
						// Create final message
						const finalMessage = {
							text: "",
							image: cloudinaryUrl,
							createdAt: Date.now(),
							user: {
								_id: user.id.toString(),
								name: user.profile.name || "Organization",
							},
						};

						// Publish to PubNub
						pubnub.publish(
							{
								channel: channelId,
								message: finalMessage,
							},
							() => {
								// Remove temp message on success
								setMessages((prevMessages) => 
									prevMessages.filter(msg => msg.id !== tempId)
								);
							}
						);
					} catch (error) {
						console.error("Error uploading to Cloudinary:", error);
						toast({
							title: "Upload Failed",
							description: "Failed to upload image. Please try again.",
							variant: "destructive",
						});
						// Remove temp message on error
						setMessages((prevMessages) => 
							prevMessages.filter(msg => msg.id !== tempId)
						);
					}
				}
			};
			reader.readAsDataURL(file);
		} catch (error) {
			console.error("Error processing image:", error);
			toast({
				title: "Error",
				description: "Failed to process image. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsUploading(false);
			// Reset file input
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	// Function to upload to Cloudinary
	const uploadToCloudinary = async (file: File): Promise<string> => {
		const cloudName = "dwfimti8w"; // Replace with your Cloudinary cloud name
		const uploadPreset = "groups"; // Replace with your upload preset
		
		const formData = new FormData();
		formData.append('file', file);
		formData.append('upload_preset', uploadPreset);
		
		const response = await fetch(
			`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
			{
				method: 'POST',
				body: formData,
			}
		);
		
		if (!response.ok) {
			throw new Error(`Upload failed with status: ${response.status}`);
		}
		
		const data = await response.json();
		return data.secure_url;
	};

	const handleImageView = (imageUrl: string) => {
		setSelectedImage(imageUrl);
		setIsImageDialogOpen(true);
		setIsImageLoading(true);
	};

	const formatTime = (timestamp: number) => {
		const date = new Date(timestamp);
		return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	};

	const isCurrentUser = (userId: string) => {
		return user?.id.toString() === userId;
	};

	return (
		<>
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
												
												{message.image && (
													<div className="relative mb-2">
														<div 
															className="relative overflow-hidden rounded-md cursor-pointer mb-1"
															style={{ maxWidth: '240px' }}
															onClick={() => handleImageView(message.image!)}
														>
															{/* eslint-disable-next-line @next/next/no-img-element */}
															<img
																src={message.image}
																alt="Chat image"
																className="w-full h-auto max-h-[240px] object-cover rounded-md"
																onError={(e) => {
																	(e.target as HTMLImageElement).src = "/placeholder-image.jpg";
																}}
															/>
															
															{message.pending && (
																<div className="absolute inset-0 bg-black/40 flex items-center justify-center">
																	<Loader2 className="h-8 w-8 text-white animate-spin" />
																</div>
															)}
														</div>
													</div>
												)}
												
												{message.text && (
													<div className="break-words">{message.text}</div>
												)}
												
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
						<input 
							type="file"
							ref={fileInputRef}
							accept="image/*"
							className="hidden"
							onChange={handleFileChange}
							disabled={isUploading || !isReady || isLoading}
						/>
						<Button
							type="button"
							size="icon"
							variant="ghost"
							onClick={handleImageClick}
							disabled={isUploading || !isReady || isLoading}
							className="text-muted-foreground hover:text-foreground"
						>
							{isUploading ? (
								<Loader2 className="h-5 w-5 animate-spin" />
							) : (
								<ImageIcon className="h-5 w-5" />
							)}
						</Button>
						
						<Input
							value={messageInput}
							onChange={(e) => setMessageInput(e.target.value)}
							placeholder="Type your message..."
							className="flex-1"
							disabled={!isReady || isLoading || isUploading}
						/>
						<Button
							type="submit"
							size="icon"
							disabled={(!messageInput.trim() && !isUploading) || !isReady || isLoading}
						>
							<SendHorizontal className="h-5 w-5" />
						</Button>
					</form>
				</CardContent>
			</Card>

			{/* Image View Dialog */}
			<Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
				<DialogContent className="max-w-4xl w-[90vw] p-0 overflow-hidden bg-transparent border-0">
					<DialogClose className="absolute right-4 top-4 z-10 p-2 bg-black/40 rounded-full text-white hover:bg-black/60">
						<X className="h-5 w-5" />
					</DialogClose>
					
					<div className="relative flex items-center justify-center min-h-[60vh]">
						{selectedImage && (
							<>
								{isImageLoading && (
									<div className="absolute inset-0 flex items-center justify-center">
										<Loader2 className="h-12 w-12 text-white animate-spin" />
									</div>
								)}
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={selectedImage}
									alt="Chat image full view"
									className="max-h-[80vh] max-w-full"
									onLoad={() => setIsImageLoading(false)}
									onError={() => {
										setIsImageLoading(false);
										toast({
											title: "Error",
											description: "Failed to load image",
											variant: "destructive",
										});
									}}
								/>
							</>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
