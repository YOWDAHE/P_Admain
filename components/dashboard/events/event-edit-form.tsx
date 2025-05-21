"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { CldUploadButton } from "next-cloudinary";
import { EventType } from "@/app/models/Event";
import { CategoryCreationResponseType } from "@/app/models/Categories";
import { Calendar } from "@/components/ui/calendar";
import { updateEvent } from "@/actions/event.action";
import { useAuth } from "@/hooks/use-auth";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import MenuBar from "@/components/ui/tip-tap-menu-bar";
import LocationInputWithMap from "./locationInputMap";
import { TicketResponseType, TicketType } from "@/app/models/Ticket";
import {
	createTicket,
	deleteTicket,
	getEventTickets,
} from "@/actions/ticket.action";
import { validateEventDescription } from "@/actions/ai-validation";
import ValidationModal from "./validation-modal";

interface EventEditFormProps {
	event: EventType;
	categories: CategoryCreationResponseType[];
}

export function EventEditForm({ event, categories }: EventEditFormProps) {
	const router = useRouter();
	const { toast } = useToast();
	const { getAccessToken } = useAuth();
	const [isLoading, setIsLoading] = useState(false);

	// Parse dates and times from ISO strings
	const startDate = parseISO(event.start_date);
	const endDate = parseISO(event.end_date);
	const startTime = parseISO(event.start_time);
	const endTime = parseISO(event.end_time);

	// Form state
	const [title, setTitle] = useState(event.title);
	const [description, setDescription] = useState(event.description || "");
	const [startDateState, setStartDate] = useState<Date | undefined>(startDate);
	const [endDateState, setEndDate] = useState<Date | undefined>(endDate);
	const [startTimeState, setStartTime] = useState<Date>(startTime);
	const [endTimeState, setEndTime] = useState<Date>(endTime);
	const [selectedCategory, setSelectedCategory] = useState<string | null>(
		event.category?.[0]?.toString() || null
	);
	const [coverImageUrl, setCoverImageUrl] = useState<string[]>(
		event.cover_image_url || []
	);
	const [location, setLocation] = useState<any>(
		event.location ? JSON.parse(event.location) : {}
	);
	const [isPublic, setIsPublic] = useState<boolean>(event.is_public);
	const [onsitePayment, setOnsitePayment] = useState<boolean>(
		event.onsite_payement || false
	);
	const [hashtags, setHashtags] = useState<string>(
		(event.hashtags?.map((el) => el.name) || []).join(", ")
	);
	const [tickets, setTickets] = useState<TicketResponseType[]>([]);
	const [newTickets, setNewTickets] = useState<
		{ name: string; price: string }[]
	>([]);

	// Add validation state
	const [validationMessage, setValidationMessage] = useState<string | null>(null);
	const [isValidating, setIsValidating] = useState(false);
	const [isDescriptionValid, setIsDescriptionValid] = useState<boolean | null>(null);
	
	// Add state for validation modal
	const [showValidationModal, setShowValidationModal] = useState(false);
	const [validationResult, setValidationResult] = useState<{
		success: boolean;
		isEventRelated: boolean;
		confidence: number;
		message: string;
	} | null>(null);

	useEffect(() => {
		const fetchTickets = async () => {
			setIsLoading(true);
			const response = await getEventTickets(event.id);
			console.log("The tickets: ", response);
			setTickets(response.tickets);
			setIsLoading(false);
		};
		fetchTickets();
	}, []);

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				bulletList: {
					HTMLAttributes: {
						class: "list-disc ml-3",
					},
				},
				orderedList: {
					HTMLAttributes: {
						class: "list-decimal ml-3",
					},
				},
			}),
			TextAlign.configure({
				types: ["heading", "paragraph"],
			}),
			Highlight,
		],
		content: description,
		editorProps: {
			attributes: {
				class: "min-h-[156px] border rounded-md bg-slate-50 py-2 px-3",
			},
		},
		onUpdate: ({ editor }) => {
			setDescription(editor.getHTML());
		},
	});

	useEffect(() => {
		if (editor && !editor.isDestroyed) {
			editor.commands.setContent(description);
		}
	}, [description, editor]);

	const combineDateTime = (date: Date, time: Date): Date => {
		return new Date(
			date.getFullYear(),
			date.getMonth(),
			date.getDate(),
			time.getHours(),
			time.getMinutes(),
			time.getSeconds()
		);
	};

	const validateDescription = async (showModal = true) => {
		if (!description || description.trim().length < 10) {
			const result = {
				success: false,
				isEventRelated: false,
				confidence: 0,
				message: "Description is too short."
			};
			
			setValidationMessage(result.message);
			setIsDescriptionValid(false);
			setValidationResult(result);
			
			if (showModal) {
				setShowValidationModal(true);
			}
			
			return false;
		}
		
		setIsValidating(true);
		setValidationMessage("Validating description...");
		
		if (showModal) {
			setShowValidationModal(true);
		}
		
		try {
			const validation = await validateEventDescription(description);
			
			setIsDescriptionValid(validation.isEventRelated);
			setValidationMessage(validation.message);
			setValidationResult(validation);
			
			if (validation.isEventRelated && showModal) {
				setShowValidationModal(false);
			}
			
			return validation.isEventRelated;
		} catch (error) {
			console.error("Error during validation:", error);
			
			const errorResult = {
				success: false,
				isEventRelated: false,
				confidence: 0,
				message: "Error validating description. Please try again."
			};
			
			setValidationMessage(errorResult.message);
			setValidationResult(errorResult);
			
			return false;
		} finally {
			setIsValidating(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
	
		if (isDescriptionValid !== true) {
			const isValid = await validateDescription(true);
			
			if (!isValid) {
				setIsLoading(false);
				return;
			}
		}
		
		try {
			if (
				!title ||
				!startDateState ||
				!endDateState ||
				!startTimeState ||
				!endTimeState ||
				!location
			) {
				throw new Error("Please fill in all required fields.");
			}

			const accessToken = getAccessToken();
			if (!accessToken) {
				throw new Error("Access token is required to update the event.");
			}

			const eventData = {
				category: selectedCategory ? [Number(selectedCategory)] : [],
				title,
				description,
				start_time: combineDateTime(startDateState, startTimeState).toISOString(),
				end_time: combineDateTime(endDateState, endTimeState).toISOString(),
				start_date: combineDateTime(startDateState, startTimeState).toISOString(),
				end_date: combineDateTime(endDateState, endTimeState).toISOString(),
				location: JSON.stringify(location),
				latitude: location.latitude || 0,
				longitude: location.longitude || 0,
				cover_image_url: coverImageUrl,
				is_public: isPublic,
				onsite_payment: onsitePayment,
				hashtags_list: hashtags.split(",").map((tag) => tag.trim()),
			};

			const response = await updateEvent(event.id, eventData, accessToken);
			if (!response.success) {
				throw new Error(response.message || "Failed to update event.");
			}

			for (const ticket of newTickets) {
				const ticketData = {
					event: event.id,
					name: ticket.name,
					price: ticket.price,
					valid_from: startDate.toISOString(),
					valid_until: endDate.toISOString(),
				};

				const ticketResponse = await createTicket(ticketData, accessToken);

				if (!ticketResponse.success) {
					throw new Error(
						ticketResponse.message || `Failed to create ticket: ${ticket.name}`
					);
				}
			}

			toast({
				title: "Success",
				description: "Event updated successfully.",
			});
			router.push("/dashboard/events");
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.message || "Failed to update event.",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleAddTicket = () => {
		setNewTickets([...newTickets, { name: "", price: "" }]);
	};

	const handleRemoveNewTicket = async (index: number) => {
		setNewTickets(newTickets.filter((_, i) => i !== index));
	};
	const handleRemoveTicket = async (index: number) => {
		await deleteTicket(tickets[index].id);
		setTickets(tickets.filter((_, i) => i !== index));
	};

	const handleTicketChange = (
		index: number,
		field: "name" | "price",
		value: string
	) => {
		const updatedTickets = [...tickets];
		updatedTickets[index][field] = value;
		setTickets(updatedTickets);
	};
	const handleNewTicketChange = (
		index: number,
		field: "name" | "price",
		value: string
	) => {
		const updatedTickets = [...newTickets];
		updatedTickets[index][field] = value;
		setNewTickets(updatedTickets);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Event Title */}
			<div className="space-y-2">
				<Label htmlFor="title">Event Title *</Label>
				<Input
					id="title"
					name="title"
					placeholder="Enter event title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					required
				/>
			</div>

			{/* Description */}
			<div className="space-y-2">
				<Label htmlFor="description">Description</Label>
				<div className="border rounded-md p-2">
					<MenuBar editor={editor} />
					<EditorContent editor={editor} />
				</div>
				
				{/* Add validation message */}
				{validationMessage && (
					<div className={`mt-2 text-sm rounded-md p-2 ${
						isDescriptionValid === true 
							? "bg-green-50 text-green-700 border border-green-200" 
							: isDescriptionValid === false
								? "bg-red-50 text-red-700 border border-red-200"
								: "bg-blue-50 text-blue-700 border border-blue-200"
					}`}>
						{validationMessage}
					</div>
				)}
				
				{/* Add validation button */}
				<Button 
					type="button" 
					variant="outline" 
					size="sm"
					className="mt-2"
					onClick={() => validateDescription(true)}
					disabled={isValidating || !description || description.trim().length < 10}
				>
					{isValidating ? "Validating..." : "Validate Description"}
				</Button>
			</div>

			{/* Dates and Times */}
			<div className="grid gap-4 md:grid-cols-2">
				<div className="space-y-2">
					<Label>Start Date *</Label>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								className={cn(
									"w-full justify-start text-left font-normal",
									!startDateState && "text-muted-foreground"
								)}
							>
								<CalendarIcon className="mr-2 h-4 w-4" />
								{startDateState ? format(startDateState, "PPP") : "Select date"}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0">
							<Calendar
								mode="single"
								selected={startDateState}
								onSelect={setStartDate}
								initialFocus
							/>
						</PopoverContent>
					</Popover>
				</div>
				<div className="space-y-2">
					<Label htmlFor="startTime">Start Time *</Label>
					<Input
						type="time"
						value={format(startTimeState, "HH:mm")}
						onChange={(e) => {
							const [hours, minutes] = e.target.value.split(":");
							const newTime = new Date(startTimeState);
							newTime.setHours(parseInt(hours));
							newTime.setMinutes(parseInt(minutes));
							setStartTime(newTime);
						}}
					/>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<div className="space-y-2">
					<Label>End Date *</Label>
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								className={cn(
									"w-full justify-start text-left font-normal",
									!endDateState && "text-muted-foreground"
								)}
							>
								<CalendarIcon className="mr-2 h-4 w-4" />
								{endDateState ? format(endDateState, "PPP") : "Select date"}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0">
							<Calendar
								mode="single"
								selected={endDateState}
								onSelect={setEndDate}
								initialFocus
							/>
						</PopoverContent>
					</Popover>
				</div>
				<div className="space-y-2">
					<Label htmlFor="endTime">End Time *</Label>
					<Input
						type="time"
						value={format(endTimeState, "HH:mm")}
						onChange={(e) => {
							const [hours, minutes] = e.target.value.split(":");
							const newTime = new Date(endTimeState);
							newTime.setHours(parseInt(hours));
							newTime.setMinutes(parseInt(minutes));
							setEndTime(newTime);
						}}
					/>
				</div>
			</div>

			{/* Category */}
			<div className="space-y-2">
				<Label htmlFor="categoryId">Category *</Label>
				<Select
					name="categoryId"
					value={selectedCategory || "none"}
					onValueChange={(value) =>
						setSelectedCategory(value === "none" ? null : value)
					}
				>
					<SelectTrigger>
						<SelectValue placeholder="Select a category" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="none">None</SelectItem>
						{categories.map((category) => (
							<SelectItem key={category.id} value={category.id.toString()}>
								{category.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Location */}
			<div className="space-y-2">
				<Label htmlFor="location">Location *</Label>
				<LocationInputWithMap
					label="Location"
					value={location || { name: "", latitude: 0, longitude: 0 }}
					onChange={(newLocation) => setLocation(newLocation)}
				/>
			</div>

			{/* Is Public */}
			<div className="space-y-2">
				<Label htmlFor="isPublic">Is Public</Label>
				<div className="flex items-center space-x-2">
					<input
						id="isPublic"
						type="checkbox"
						checked={isPublic}
						onChange={(e) => setIsPublic(e.target.checked)}
					/>
					<Label htmlFor="isPublic">Make this event public</Label>
				</div>
			</div>

			{/* Onsite Payment */}
			<div className="space-y-2">
				<Label htmlFor="onsitePayment">Onsite Payment</Label>
				<div className="flex items-center space-x-2">
					<input
						id="onsitePayment"
						type="checkbox"
						checked={onsitePayment}
						onChange={(e) => setOnsitePayment(e.target.checked)}
					/>
					<Label htmlFor="onsitePayment">Enable onsite payment</Label>
				</div>
			</div>

			{/* Hashtags */}
			<div className="space-y-2">
				<Label htmlFor="hashtags">Hashtags</Label>
				<Input
					id="hashtags"
					name="hashtags"
					placeholder="Enter hashtags separated by commas"
					value={hashtags}
					onChange={(e) => setHashtags(e.target.value)}
				/>
			</div>

			{/* Cover Images */}
			<div className="space-y-2">
				<Label>Cover Images</Label>
				<div className="flex flex-wrap gap-4">
					{coverImageUrl.length > 0 &&
						coverImageUrl.map((url, index) => (
							<Image
								key={index}
								src={url}
								width={120}
								height={120}
								alt={`Cover ${index + 1}`}
								className="rounded-md"
							/>
						))}
				</div>
				<CldUploadButton
					uploadPreset="organizers"
					className="bg-blue-500 px-4 py-2 text-white rounded-sm block"
					onSuccess={(result) => {
						const files = Array.isArray(result.info) ? result.info : [result.info];
						const urls = files.map((file) => file.secure_url);
						setCoverImageUrl((prev) => [...prev, ...urls]);
					}}
					options={{
						multiple: true,
						resourceType: "auto",
					}}
				/>
			</div>

			{/* Tickets */}
			<div className="space-y-4">
				<Label>Tickets</Label>
				<br />
				{tickets &&
					tickets.map((ticket, index) => (
						<div key={index} className="flex items-center space-x-4">
							<Input
								placeholder="Ticket Name"
								value={ticket.name}
								// onChange={(e) => handleTicketChange(index, "name", e.target.value)}
								disabled
							/>
							<Input
								placeholder="Ticket Price"
								value={ticket.price}
								// onChange={(e) => handleTicketChange(index, "price", e.target.value)}
								disabled
							/>
							<Button
								type="button"
								variant="destructive"
								onClick={() => handleRemoveTicket(index)}
							>
								Remove
							</Button>
						</div>
					))}
				{newTickets.map((ticket, index) => (
					<div key={index} className="flex items-center space-x-4">
						<Input
							placeholder="Ticket Name"
							value={ticket.name}
							onChange={(e) => handleNewTicketChange(index, "name", e.target.value)}
							required
						/>
						<Input
							placeholder="Ticket Price"
							value={ticket.price}
							onChange={(e) => handleNewTicketChange(index, "price", e.target.value)}
							required
						/>
						{newTickets.length > 0 && (
							<Button
								type="button"
								variant="destructive"
								onClick={() => handleRemoveNewTicket(index)}
							>
								Remove
							</Button>
						)}
					</div>
				))}
				<Button type="button" onClick={handleAddTicket}>
					Add Ticket
				</Button>
			</div>

			{/* Submit Button */}
			<div className="flex justify-between">
				<Button
					type="button"
					variant="outline"
					onClick={() => router.push("/dashboard/events")}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={isLoading || isValidating}>
					{isLoading 
						? "Updating Event..." 
						: isValidating
							? "Validating..."
							: "Update Event"
					}
				</Button>
			</div>
			
			{/* Validation Modal */}
			<ValidationModal
				isOpen={showValidationModal}
				onClose={() => setShowValidationModal(false)}
				validationResult={validationResult}
				isValidating={isValidating}
			/>
		</form>
	);
}
