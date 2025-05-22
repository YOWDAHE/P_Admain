"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
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
import { format, parseISO, isBefore, startOfDay } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { createEvent } from "@/actions/event.action";
import { createTicket } from "@/actions/ticket.action";
import { useAuth } from "@/hooks/use-auth";
import { Calendar } from "@/components/ui/calendar";
import { CategoryCreationResponseType } from "@/app/models/Categories";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import MenuBar from "@/components/ui/tip-tap-menu-bar";
import LocationInputWithMap from "./locationInputMap";
import { validateEventDescription } from "@/actions/ai-validation";
import ValidationModal from "./validation-modal";
import { Info } from "lucide-react";
import { CloudinaryUploader } from "@/components/cloudinary-uploader";
import { TagInput } from "@/components/ui/tag-input";

interface EventFormProps {
	categories: CategoryCreationResponseType[];
}

export function EventForm({ categories }: EventFormProps) {
	const router = useRouter();
	const { toast } = useToast();
	const [isLoading, setIsLoading] = useState(false);
	const { getAccessToken, user } = useAuth();

	// Check verification status
	const isVerified = user?.profile?.verification_status === "approved";

	// Other state variables
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [lat, setLat] = useState(0);
	const [lon, setLon] = useState(0);
	
	// Initialize dates with today's date
	const today = new Date();
	const [startDate, setStartDate] = useState<Date | undefined>(today);
	const [endDate, setEndDate] = useState<Date | undefined>(today);
	const [startTime, setStartTime] = useState<Date | undefined>(new Date());
	const [endTime, setEndTime] = useState<Date | undefined>(new Date());
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [coverImageUrl, setCoverImageUrl] = useState<string[]>([]);
	const [location, setLocation] = useState<string>(
		JSON.stringify({ name: null, latitude: null, longitude: null })
	);
	
	// Set isPublic to false by default for unverified users
	const [isPublic, setIsPublic] = useState<boolean>(isVerified);
	const [onsitePayment, setOnsitePayment] = useState<boolean>(false);
	const [hashtags, setHashtags] = useState<string>("");
	const [tickets, setTickets] = useState<{ name: string; price: string }[]>([
		{ name: "", price: "" },
	]);

	const [validationMessage, setValidationMessage] = useState<string | null>(
		null
	);
	const [isValidating, setIsValidating] = useState(false);
	const [isDescriptionValid, setIsDescriptionValid] = useState<boolean | null>(
		null
	);

	const [showValidationModal, setShowValidationModal] = useState(false);
	const [validationResult, setValidationResult] = useState<{
		success: boolean;
		isEventRelated: boolean;
		confidence: number;
		message: string;
	} | null>(null);

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
		content: "",
		editorProps: {
			attributes: {
				class: "min-h-[156px] border rounded-md bg-slate-50 py-2 px-3",
			},
		},
		onUpdate: ({ editor }) => {
			setDescription(editor.getHTML());
		},
	});

	const handleAddTicket = () => {
		setTickets([...tickets, { name: "", price: "" }]);
	};

	const handleRemoveTicket = (index: number) => {
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
				message: "Description is too short to validate.",
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
				message: "Error validating description. Please try again.",
			};

			setValidationMessage(errorResult.message);
			setValidationResult(errorResult);

			return false;
		} finally {
			setIsValidating(false);
		}
	};

	// Function to check if a date is before today (to disable past dates)
	const isDateBeforeToday = (date: Date) => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		return date < today;
	};

	// Function to check if a date is before the start date (to disable invalid end dates)
	const isDateBeforeStartDate = (date: Date) => {
		if (!startDate) return false;
		
		// Create copies to compare just the dates, not times
		const startDateCopy = new Date(startDate);
		startDateCopy.setHours(0, 0, 0, 0);
		
		const dateCopy = new Date(date);
		dateCopy.setHours(0, 0, 0, 0);
		
		return dateCopy < startDateCopy;
	};

	// Function to handle start date changes
	const handleStartDateChange = (date: Date | undefined) => {
		setStartDate(date);
		
		// If end date is before the new start date, update end date to match start date
		if (date && endDate && new Date(date) > new Date(endDate)) {
			setEndDate(date);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		setIsLoading(true);

		const isValid = await validateDescription(true);

		if (!isValid) {
			setIsLoading(false);
			return;
		}

		try {
			if (
				!title ||
				!startDate ||
				!endDate ||
				!startTime ||
				!endTime ||
				!location
			) {
				throw new Error("Please fill in all required fields.");
			}

			if (tickets.some((ticket) => !ticket.name || !ticket.price)) {
				throw new Error("Please provide a name and price for all tickets.");
			}

			// Force is_public to false for unverified users as a security measure
			const is_public_value = isVerified ? isPublic : false;
			
			// If an unverified user somehow managed to set isPublic to true, display a warning
			if (!isVerified && isPublic) {
				toast({
					title: "Public events unavailable",
					description: "Only verified organizers can create public events. Your event will be set to private.",
					variant: "default",
					className: "bg-yellow-50 border-yellow-200 text-yellow-800",
				});
				setIsPublic(false);
			}

			const eventData = {
				category: [Number(selectedCategory)],
				title,
				description,
				start_time: combineDateTime(startDate, startTime).toISOString(),
				end_time: combineDateTime(endDate, endTime).toISOString(),
				start_date: combineDateTime(startDate, startTime).toISOString(),
				end_date: combineDateTime(endDate, endTime).toISOString(),
				location,
				latitude: lat,
				longitude: lon,
				cover_image_url: coverImageUrl || "",
				is_public: is_public_value,
				onsite_payement: onsitePayment,
				hashtags_list: hashtags.split(",").map((tag) => tag.trim()),
			};

			const accessToken = getAccessToken();

			if (!accessToken) {
				throw new Error("Access token is required to create an event.");
			}

			const eventResponse = await createEvent(eventData, accessToken);

			if (!eventResponse.success || !eventResponse.data) {
				throw new Error(eventResponse.message || "Failed to create event.");
			}
			for (const ticket of tickets) {
				const ticketData = {
					event: eventResponse.data.id,
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
				description: "Event and tickets created successfully.",
			});
			router.push("/dashboard/events");
		} catch (error: any) {
			toast({
				title: "Error",
				description:
					error.message || "Failed to create event and tickets. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Verification notice for unverified users */}
			{!isVerified && (
				<div className="mb-6 p-4 border border-yellow-200 bg-yellow-50 rounded-md">
					<div className="flex items-start">
						<Info className="h-5 w-5 text-yellow-500 mt-0.5 mr-3" />
						<div>
							<h3 className="font-medium text-yellow-800">Account Verification Required</h3>
							<p className="text-sm text-yellow-700 mt-1">
								Your account is not verified yet. You can create events, but they will be private only.
								To create public events, please complete the verification process in your 
								<a href="/dashboard/settings" className="text-blue-600 underline ml-1">account settings</a>.
							</p>
						</div>
					</div>
				</div>
			)}
			
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
					<div
						className={`mt-2 text-sm rounded-md p-2 ${
							isDescriptionValid === true
								? "bg-green-50 text-green-700 border border-green-200"
								: isDescriptionValid === false
								? "bg-red-50 text-red-700 border border-red-200"
								: "bg-blue-50 text-blue-700 border border-blue-200"
						}`}
					>
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
									!startDate && "text-muted-foreground"
								)}
							>
								<CalendarIcon className="mr-2 h-4 w-4" />
								{startDate ? format(startDate, "PPP") : "Select date"}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0">
							<Calendar
								mode="single"
								selected={startDate}
								onSelect={handleStartDateChange}
								disabled={isDateBeforeToday}
								initialFocus
							/>
						</PopoverContent>
					</Popover>
				</div>

				<div className="space-y-2">
					<Label htmlFor="startTime">Start Time *</Label>
					<Input
						type="time"
						value={startTime ? format(startTime, "HH:mm") : ""}
						onChange={(e) => {
							const [hours, minutes] = e.target.value.split(":");
							const newTime = new Date(startTime || new Date());
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
									!endDate && "text-muted-foreground"
								)}
							>
								<CalendarIcon className="mr-2 h-4 w-4" />
								{endDate ? format(endDate, "PPP") : "Select date"}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-0">
							<Calendar
								mode="single"
								selected={endDate}
								onSelect={setEndDate}
								disabled={(date) => isDateBeforeToday(date) || isDateBeforeStartDate(date)}
								initialFocus
							/>
						</PopoverContent>
					</Popover>
				</div>

				<div className="space-y-2">
					<Label htmlFor="endTime">End Time *</Label>
					<Input
						type="time"
						value={endTime ? format(endTime, "HH:mm") : ""}
						onChange={(e) => {
							const [hours, minutes] = e.target.value.split(":");
							const newTime = new Date(endTime || new Date());
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
				{/* <Label htmlFor="location">Location *</Label> */}
				{/* <Input
					id="location"
					name="location"
					placeholder="Enter event location"
					value={location}
					onChange={(e) => setLocation(e.target.value)}
					required
				/> */}
				<LocationInputWithMap
					label="Location"
					value={JSON.parse(location)}
					onChange={(newLocation) => {
						setLocation(JSON.stringify(newLocation));
						setLat(newLocation.latitude);
						setLon(newLocation.longitude);
					}}
				/>
			</div>

			{/* Is Public */}
			<div className="space-y-2">
				<Label htmlFor="isPublic" className="flex items-center justify-between">
					<span>Is Public</span>
					{!isVerified && (
						<span className="text-xs text-yellow-600 font-normal">
							Verification required
						</span>
					)}
				</Label>
				<div className="flex flex-col space-y-2">
					<div className="flex items-center space-x-2">
						<input
							id="isPublic"
							type="checkbox"
							checked={isPublic}
							onChange={(e) => isVerified && setIsPublic(e.target.checked)}
							disabled={!isVerified}
							className={!isVerified ? "opacity-50 cursor-not-allowed" : ""}
						/>
						<Label 
							htmlFor="isPublic"
							className={!isVerified ? "opacity-70" : ""}
						>
							Make this event public
						</Label>
					</div>
					{!isVerified && (
						<p className="text-xs text-gray-500 mt-1">
							Only verified organizers can create public events. Please complete verification in settings to enable this option.
						</p>
					)}
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

			{/* Cover Image */}
			<div className="space-y-2">
				<Label htmlFor="coverImageUrl">Cover Image URL</Label>
				{coverImageUrl.length > 0 && (
					<Image src={coverImageUrl[0]} width={200} height={200} alt="Cover Image" />
				)}
				<CloudinaryUploader
					uploadPreset="organizers"
					className="bg-blue-500 px-10 py-2 text-white rounded-sm block"
					onSuccess={(result: any) => {
						const files = Array.isArray(result.info) ? result.info : [result.info];
						const urls = files.map((file: any) => file.secure_url);
						setCoverImageUrl((prev) => [...prev, ...urls]);
					}}
					onError={(e: any) => {
						console.error(e);
					}}
					options={{
						multiple: true,
						resourceType: "auto",
					}}
				>
					Upload Cover Image
				</CloudinaryUploader>
			</div>

			{/* Tickets */}
			<div className="space-y-4">
				<Label>Tickets</Label>
				{tickets.map((ticket, index) => (
					<div key={index} className="flex items-center space-x-4">
						<Input
							placeholder="Ticket Name"
							value={ticket.name}
							onChange={(e) => handleTicketChange(index, "name", e.target.value)}
							required
						/>
						<Input
							placeholder="Ticket Price"
							value={ticket.price}
							onChange={(e) => handleTicketChange(index, "price", e.target.value)}
							required
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
				<Button type="button" onClick={handleAddTicket}>
					Add Ticket
				</Button>
			</div>

			{/* Submit Button */}
			<div className="flex justify-end space-x-4">
				<Button
					type="button"
					variant="outline"
					onClick={() => router.push("/dashboard/events")}
				>
					Cancel
				</Button>
				<Button
					type="submit"
					className="w-[200px]"
					disabled={isLoading || isValidating}
				>
					{isLoading
						? "Creating Event..."
						: isValidating
						? "Validating..."
						: "Create Event"}
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
