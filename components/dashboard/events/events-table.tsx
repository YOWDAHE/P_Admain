"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, Edit, Eye, MoreHorizontal, Search, Trash } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { EventType } from "@/app/models/Event";
import { deleteEvent } from "@/actions/event.action";
import { useAuth } from "@/hooks/use-auth";
import { EventQRPreview } from "./event-qr-preview";
import { EventQRModal } from "./event-qr-modal";
import { Input } from "@/components/ui/input";

interface EventsTableProps {
	events: EventType[];
}

export function EventsTable({ events }: EventsTableProps) {
	const router = useRouter();
	const { toast } = useToast();
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [eventToDelete, setEventToDelete] = useState<number | null>(null);
	const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
	const [isQRModalOpen, setIsQRModalOpen] = useState(false);
	const { tokens } = useAuth();
	
	// Search and pagination state
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [filteredEvents, setFilteredEvents] = useState<EventType[]>(events);
	const eventsPerPage = 5;
	
	// Filter events based on search query
	useEffect(() => {
		if (!searchQuery.trim()) {
			setFilteredEvents(events);
		} else {
			const lowercasedQuery = searchQuery.toLowerCase();
			const filtered = events.filter(event => 
				event.title.toLowerCase().includes(lowercasedQuery) ||
				(JSON.parse(event.location).name || "").toLowerCase().includes(lowercasedQuery) ||
				event.description.toLowerCase().includes(lowercasedQuery)
			);
			setFilteredEvents(filtered);
		}
		setCurrentPage(1);
	}, [searchQuery, events]);
	
	// Calculate pagination values
	const indexOfLastEvent = currentPage * eventsPerPage;
	const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
	const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
	const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
	
	// Change page
	const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
	const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
	const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

	const handleDelete = async () => {
		if (!eventToDelete) return;

		try {
			if (!tokens?.access) {
				toast({
					title: "Error",
					description: "Access token is missing. Please log in again.",
					variant: "destructive",
				});
				return;
			}

			const response = await deleteEvent(eventToDelete, tokens?.access);

			if (response.success) {
				toast({
					title: "Event deleted",
					description: "The event has been deleted successfully.",
				});
				router.refresh();
			} else {
				toast({
					title: "Error",
					description: response.message,
					variant: "destructive",
				});
			}
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.message || "Failed to delete event. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsDeleteDialogOpen(false);
			setEventToDelete(null);
		}
	};

	const getStatusBadge = (status: boolean) => {
		switch (status) {
			case true:
				return <Badge>Published</Badge>;
			default:
				return <Badge variant="outline">Draft</Badge>;
		}
	};

	if (events.length === 0) {
		return (
			<div className="rounded-md border border-border p-8 text-center dark:bg-background">
				<Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
				<h3 className="mt-2 text-lg font-semibold">No events found</h3>
				<p className="mt-1 text-sm text-muted-foreground">
					Get started by creating a new event.
				</p>
				<Button className="mt-6" asChild>
					<Link href="/dashboard/events/new">Create Event</Link>
				</Button>
			</div>
		);
	}

	return (
		<>
			{/* Search Bar */}
			<div className="flex items-center gap-2 mb-4">
				<div className="relative w-[400px]">
					<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Search events..."
						className="pl-9"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
			</div>
		
			<div className="rounded-md border border-border overflow-hidden bg-white">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Title</TableHead>
							<TableHead>Date</TableHead>
							<TableHead>Location</TableHead>
							<TableHead>Status</TableHead>
							{/* <TableHead>Category</TableHead> */}
							<TableHead>QR Code</TableHead>
							<TableHead className="w-[80px]">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{currentEvents.length === 0 ? (
							<TableRow>
								<TableCell colSpan={7} className="text-center py-6">
									No events found matching your search.
								</TableCell>
							</TableRow>
						) : (
							currentEvents.map((event) => (
								<TableRow
									key={event.id}
									className="cursor-pointer"
									onClick={() => router.push(`/dashboard/events/${event.id}`)}
								>
									<TableCell className="font-medium">{event.title}</TableCell>
									<TableCell>{new Date(event.start_time).toLocaleDateString()}</TableCell>
									<TableCell>{JSON.parse(event.location).name || "No location"}</TableCell>
									<TableCell>{getStatusBadge(event.is_public)}</TableCell>
									{/* <TableCell>{"Uncategorized"}</TableCell> */}
									<TableCell onClick={(e) => e.stopPropagation()}>
										<EventQRPreview
											event={event}
											onClick={() => {
												setSelectedEvent(event);
												setIsQRModalOpen(true);
											}}
										/>
									</TableCell>
									<TableCell onClick={(e) => e.stopPropagation()}>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" size="icon">
													<MoreHorizontal className="h-4 w-4" />
													<span className="sr-only">Open menu</span>
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuLabel>Actions</DropdownMenuLabel>
												<DropdownMenuSeparator />
												<DropdownMenuItem asChild>
													<Link href={`/dashboard/events/${event.id}/details`}>
														<Eye className="mr-2 h-4 w-4" />
														View Details
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem asChild>
													<Link href={`/dashboard/events/${event.id}/edit`}>
														<Edit className="mr-2 h-4 w-4" />
														Edit
													</Link>
												</DropdownMenuItem>
												<DropdownMenuItem
													className="text-red-600 dark:text-red-400"
													onClick={() => {
														setEventToDelete(event.id);
														setIsDeleteDialogOpen(true);
													}}
												>
													<Trash className="mr-2 h-4 w-4" />
													Delete
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
			
			{/* Pagination */}
			{filteredEvents.length > 0 && (
				<div className="flex items-center justify-between mt-4">
					<div className="text-sm text-muted-foreground">
						Showing {indexOfFirstEvent + 1}-{Math.min(indexOfLastEvent, filteredEvents.length)} of {filteredEvents.length} events
					</div>
					<div className="flex items-center space-x-2">
						<Button 
							variant="outline" 
							size="icon" 
							onClick={prevPage} 
							disabled={currentPage === 1}
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						{Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
							// Logic to show pages around current page
							let pageNumber: number;
							if (totalPages <= 5) {
								pageNumber = idx + 1;
							} else if (currentPage <= 3) {
								pageNumber = idx + 1;
							} else if (currentPage >= totalPages - 2) {
								pageNumber = totalPages - 4 + idx;
							} else {
								pageNumber = currentPage - 2 + idx;
							}
							
							return (
								<Button
									key={pageNumber}
									variant={currentPage === pageNumber ? "default" : "outline"}
									size="icon"
									onClick={() => paginate(pageNumber)}
								>
									{pageNumber}
								</Button>
							);
						})}
						<Button 
							variant="outline" 
							size="icon" 
							onClick={nextPage} 
							disabled={currentPage === totalPages}
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}

			<AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the event and
							all associated data.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
						>
							Delete
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<EventQRModal
				event={selectedEvent}
				isOpen={isQRModalOpen}
				onClose={() => {
					setIsQRModalOpen(false);
					setSelectedEvent(null);
				}}
			/>
		</>
	);
}
