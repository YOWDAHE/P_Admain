"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
	updateOrganizerProfile,
	UpdateOrganizerProfilePayload,
} from "@/actions/organizer.action";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
	Info,
	Shield,
	Upload,
	FileCheck,
	AlertTriangle,
	X,
	Camera,
	Pen,
} from "lucide-react";
import { VerificationAlert } from "@/components/dashboard/verification-alert";
import { CloudinaryUploader } from "@/components/cloudinary-uploader";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const OrganizerProfilePage = () => {
	const { user, getAccessToken, updateUser } = useAuth();
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isVerificationLoading, setIsVerificationLoading] = useState(false);
	const [isProfileImageOpen, setIsProfileImageOpen] = useState(false);

	const [formData, setFormData] = useState<UpdateOrganizerProfilePayload>({
		name: user?.profile?.name || "",
		description: user?.profile?.description || "",
		logo_url: user?.profile?.logo_url || "",
		contact_phone: user?.profile?.contact_phone || "",
		website_url: user?.profile?.website_url || "",
		verification_id: user?.profile?.verification_id || "",
		social_media_links: {
			facebook: user?.profile?.social_media_links?.facebook || "",
			twitter: user?.profile?.social_media_links?.twitter || "",
			instagram: user?.profile?.social_media_links?.instagram || "",
		},
	});

	useEffect(() => {
		if (user) {
			setFormData({
				name: user?.profile?.name || "",
				description: user?.profile?.description || "",
				logo_url: user?.profile?.logo_url || "",
				contact_phone: user?.profile?.contact_phone || "",
				website_url: user?.profile?.website_url || "",
				verification_id: user?.profile?.verification_id || "",
				social_media_links: {
					facebook: user?.profile?.social_media_links?.facebook || "",
					twitter: user?.profile?.social_media_links?.twitter || "",
					instagram: user?.profile?.social_media_links?.instagram || "",
				},
			});
		}
	}, [user]);

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;

		if (name.includes(".")) {
			const [parent, child] = name.split(".");
			setFormData({
				...formData,
				[parent]: {
					...(formData[parent as keyof UpdateOrganizerProfilePayload] as Record<
						string,
						any
					>),
					[child]: value,
				},
			});
		} else {
			setFormData({
				...formData,
				[name]: value,
			});
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const accessToken = getAccessToken();
			if (!accessToken) {
				toast.error("Authentication error. Please login again.");
				return;
			}

			const response = await updateOrganizerProfile(formData, accessToken);

			if (response.success && response.data && user) {
				// Ensure social_media_links is never null by providing empty strings as default
				const socialMediaLinks = {
					facebook: formData.social_media_links?.facebook || "",
					twitter: formData.social_media_links?.twitter || "",
					instagram: formData.social_media_links?.instagram || "",
				};

				// Update the user in auth context with the response data
				const updatedProfile = {
					...user.profile,
					name: formData.name,
					description: formData.description,
					logo_url: formData.logo_url,
					contact_phone: formData.contact_phone,
					website_url: formData.website_url,
					verification_id: formData.verification_id,
					social_media_links: socialMediaLinks,
				};

				updateUser({
					...user,
					profile: {
						...updatedProfile,
						verification_id: updatedProfile.verification_id || "",
					},
				});

				toast.success("Profile updated successfully!");
				setIsOpen(false);
			} else {
				toast.error(response.message || "Failed to update profile");
			}
		} catch (error) {
			console.error("Error updating profile:", error);
			toast.error("An unexpected error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	const handleProfileLogoUpdate = async (url: string) => {
		try {
			const accessToken = getAccessToken();
			if (!accessToken) {
				toast.error("Authentication error. Please login again.");
				return;
			}

			const logoData = {
				...formData,
				logo_url: url,
			};

			const response = await updateOrganizerProfile(logoData, accessToken);

			if (response.success && response.data && user) {
				// Update the user in auth context with the response data
				const updatedProfile = {
					...user.profile,
					logo_url: url,
				};

				updateUser({
					...user,
					profile: updatedProfile,
				});

				setFormData({
					...formData,
					logo_url: url,
				});

				toast.success("Profile logo updated successfully!");
				setIsProfileImageOpen(false);
			} else {
				toast.error(response.message || "Failed to update profile logo");
			}
		} catch (error) {
			console.error("Error updating profile logo:", error);
			toast.error("An unexpected error occurred");
		}
	};

	const handleVerificationUpload = async (url: string) => {
		setIsVerificationLoading(true);
		try {
			const accessToken = getAccessToken();
			if (!accessToken) {
				toast.error("Authentication error. Please login again.");
				return;
			}

			const verificationData = {
				name: user?.profile?.name || "",
				description: user?.profile?.description || "",
				logo_url: user?.profile?.logo_url || "",
				contact_phone: user?.profile?.contact_phone || "",
				website_url: user?.profile?.website_url || "",
				verification_id: url, // Only update this field
				social_media_links: {
					facebook: user?.profile?.social_media_links?.facebook || "",
					twitter: user?.profile?.social_media_links?.twitter || "",
					instagram: user?.profile?.social_media_links?.instagram || "",
				},
			};

			const response = await updateOrganizerProfile(verificationData, accessToken);

			if (response.success && response.data && user) {
				// Update the user in auth context with the response data
				const updatedProfile = {
					...user.profile,
					verification_id: url,
				};

				updateUser({
					...user,
					profile: updatedProfile,
				});

				toast.success("Verification document uploaded successfully!");
			} else {
				toast.error(response.message || "Failed to update verification document");
			}
		} catch (error) {
			console.error("Error updating verification:", error);
			toast.error("An unexpected error occurred");
		} finally {
			setIsVerificationLoading(false);
		}
	};

	if (!user) {
		return (
			<div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
				<div className="bg-white shadow-lg rounded-lg p-8 text-center">
					<h1 className="text-xl font-bold">Loading profile information...</h1>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-100 p-8">
			{/* Verification Alert */}
			{user?.profile && (
				<div className="max-w-4xl mx-auto mb-6">
					<VerificationAlert verificationStatus={user.profile.verification_status} />
				</div>
			)}

			<div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden mb-6">
				{/* Header */}
				<div className="bg-blue-600 text-white p-6 flex items-center justify-between">
					<div className="flex items-center">
						<div className="relative">
							<div className="p-4 flex justify-center">
								<CloudinaryUploader
									uploadPreset="organizers"
									className="p-2 rounded-full bg-black/90 absolute bottom-0 right-3"
									sources={["local", "url", "image_search"]}
									onSuccess={(result: any) => {
										if (result.info && result.info.secure_url) {
											const url = result.info.secure_url;
											handleProfileLogoUpdate(url);
										} else {
											toast.error("Failed to upload logo");
										}
									}}
									onError={(error: any) => {
										console.error("Upload error:", error);
										toast.error("Error uploading logo");
									}}
								>
									<Pen className="h-4 w-4" />
								</CloudinaryUploader>
							</div>
							<Dialog open={isProfileImageOpen} onOpenChange={setIsProfileImageOpen}>
								<DialogTrigger asChild>
									<img
										src={user.profile?.logo_url || "/placeholder-logo.png"}
										alt={`${user.profile?.name || "Organization"} Logo`}
										className="w-20 h-20 rounded-full object-cover mr-6 cursor-pointer hover:opacity-90 transition-opacity border-2 border-white"
									/>
								</DialogTrigger>
								<DialogContent className="sm:max-w-[90vw] max-h-[90vh] p-0 overflow-hidden flex flex-col">
									<div className="relative h-full">
										<Button
											variant="ghost"
											size="icon"
											className="absolute top-2 right-2 text-white bg-black/50 hover:bg-black/70 z-10 rounded-full"
											onClick={() => setIsProfileImageOpen(false)}
										>
											<X className="h-5 w-5" />
										</Button>
										<div className="flex items-center justify-center h-[calc(90vh-80px)] bg-black">
											<img
												src={user.profile?.logo_url || "/placeholder-logo.png"}
												alt={`${user.profile?.name || "Organization"} Logo`}
												className="max-w-full max-h-full object-contain"
											/>
										</div>
									</div>
								</DialogContent>
							</Dialog>
						</div>
						<div>
							<h1 className="text-2xl font-bold">
								{user.profile?.name || "Organization Name"}
							</h1>
							<p className="text-sm">
								{user.email} • {user.role}
							</p>
						</div>
					</div>

					<Dialog open={isOpen} onOpenChange={setIsOpen}>
						<DialogTrigger asChild>
							<Button
								variant="outline"
								className="bg-white text-blue-600 hover:bg-blue-50"
							>
								Edit Profile
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
							<DialogHeader>
								<DialogTitle>Edit Organization Profile</DialogTitle>
							</DialogHeader>

							<form onSubmit={handleSubmit} className="space-y-4 py-4">
								<div className="grid gap-4">
									<div className="grid gap-2">
										<label htmlFor="name" className="text-sm font-medium">
											Organization Name
										</label>
										<Input
											id="name"
											name="name"
											value={formData.name}
											onChange={handleInputChange}
											required
										/>
									</div>

									<div className="grid gap-2">
										<label htmlFor="description" className="text-sm font-medium">
											Description
										</label>
										<Textarea
											id="description"
											name="description"
											value={formData.description}
											onChange={handleInputChange}
											rows={3}
										/>
									</div>

									<div className="grid gap-2">
										<label className="text-sm font-medium">Organization Logo</label>
										{formData.logo_url && (
											<div className="mb-2 flex justify-center">
												<img
													src={formData.logo_url}
													alt="Organization Logo"
													className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
												/>
											</div>
										)}
										<CloudinaryUploader
											uploadPreset="organizers"
											className="px-10 py-2 text-black text-sm rounded-sm block border-gray-300 border-2 w-full hover:bg-gray-50 z-[999]"
											sources={["local", "url", "image_search"]}
											onSuccess={(result: any) => {
												if (result.info && result.info.secure_url) {
													const url = result.info.secure_url;
													toast.success("Logo uploaded successfully");
													setFormData({
														...formData,
														logo_url: url,
													});
												} else {
													toast.error("Failed to upload logo");
												}
											}}
											onError={(error: any) => {
												console.error("Upload error:", error);
												toast.error("Error uploading logo");
											}}
											onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
												e.stopPropagation();
											}}
										>
											{formData.logo_url ? "Change Logo" : "Upload Logo"}
										</CloudinaryUploader>
									</div>

									<div className="grid gap-2">
										<label htmlFor="contact_phone" className="text-sm font-medium">
											Contact Phone
										</label>
										<Input
											id="contact_phone"
											name="contact_phone"
											value={formData.contact_phone}
											onChange={handleInputChange}
										/>
									</div>

									<div className="grid gap-2">
										<label htmlFor="website_url" className="text-sm font-medium">
											Website URL
										</label>
										<Input
											id="website_url"
											name="website_url"
											value={formData.website_url}
											onChange={handleInputChange}
										/>
									</div>

									<div className="border-t pt-4 mt-2">
										<h3 className="text-sm font-medium mb-2">Social Media Links</h3>

										<div className="grid gap-2">
											<label htmlFor="facebook" className="text-sm font-medium">
												Facebook
											</label>
											<Input
												id="facebook"
												name="social_media_links.facebook"
												value={formData.social_media_links?.facebook || ""}
												onChange={handleInputChange}
											/>
										</div>

										<div className="grid gap-2">
											<label htmlFor="twitter" className="text-sm font-medium">
												Twitter
											</label>
											<Input
												id="twitter"
												name="social_media_links.twitter"
												value={formData.social_media_links?.twitter || ""}
												onChange={handleInputChange}
											/>
										</div>

										<div className="grid gap-2">
											<label htmlFor="instagram" className="text-sm font-medium">
												Instagram
											</label>
											<Input
												id="instagram"
												name="social_media_links.instagram"
												value={formData.social_media_links?.instagram || ""}
												onChange={handleInputChange}
											/>
										</div>
									</div>
								</div>

								<DialogFooter>
									<Button type="submit" disabled={isLoading}>
										{isLoading ? "Saving..." : "Save Changes"}
									</Button>
								</DialogFooter>
							</form>
						</DialogContent>
					</Dialog>
				</div>

				{/* Body */}
				<div className="p-6 space-y-4">
					<p>
						<strong>Description:</strong>{" "}
						{user.profile?.description || "No description provided"}
					</p>
					<p>
						<strong>Contact:</strong>{" "}
						{user.profile?.contact_phone || "No contact number provided"}
					</p>
					<p>
						<strong>Email: </strong>
						{user.email}
					</p>

					<div>
						<h2 className="font-semibold mt-4">Social Media</h2>
						{user.profile?.social_media_links &&
						(user.profile.social_media_links.facebook ||
							user.profile.social_media_links.twitter ||
							user.profile.social_media_links.instagram) ? (
							<ul className="flex space-x-4 mt-2">
								{user.profile.social_media_links.facebook && (
									<li>
										<a
											href={user.profile.social_media_links.facebook}
											target="_blank"
											rel="noopener noreferrer"
											className="text-blue-600 hover:underline"
										>
											Facebook
										</a>
									</li>
								)}
								{user.profile.social_media_links.twitter && (
									<li>
										<a
											href={user.profile.social_media_links.twitter}
											target="_blank"
											rel="noopener noreferrer"
											className="text-blue-400 hover:underline"
										>
											Twitter
										</a>
									</li>
								)}
								{user.profile.social_media_links.instagram && (
									<li>
										<a
											href={user.profile.social_media_links.instagram}
											target="_blank"
											rel="noopener noreferrer"
											className="text-pink-600 hover:underline"
										>
											Instagram
										</a>
									</li>
								)}
							</ul>
						) : (
							<p className="text-gray-500 mt-2">No social media links provided</p>
						)}
					</div>
				</div>
			</div>

			{/* Separate Verification Section */}
			<Card className="max-w-4xl mx-auto mb-6">
				<CardHeader className="flex flex-row items-center gap-4">
					<div className="rounded-full bg-blue-100 p-2">
						<Shield className="h-6 w-6 text-blue-600" />
					</div>
					<div>
						<CardTitle>Verification Status</CardTitle>
						<CardDescription>
							Verification is required to create public events on the platform
						</CardDescription>
					</div>
				</CardHeader>
				<CardContent>
					{/* Status Display */}
					<div className="mb-6">
						<div
							className={`flex items-center gap-2 font-medium ${
								user.profile?.verification_status === "approved"
									? "text-green-600"
									: user.profile?.verification_status === "pending"
									? "text-amber-600"
									: user.profile?.verification_status === "denied"
									? "text-red-600"
									: "text-gray-600"
							}`}
						>
							{user.profile?.verification_status === "approved" ? (
								<>
									<FileCheck className="h-5 w-5" /> Verified
								</>
							) : user.profile?.verification_status === "pending" ? (
								<>
									<Info className="h-5 w-5" /> Pending Verification
								</>
							) : user.profile?.verification_status === "denied" ? (
								<>
									<AlertTriangle className="h-5 w-5" /> Verification Denied
								</>
							) : (
								<>
									<Info className="h-5 w-5" /> Not Verified
								</>
							)}
						</div>

						{user.profile?.verification_status === "denied" && (
							<Alert className="mt-4 bg-red-50 border-red-200">
								<AlertTriangle className="h-4 w-4 text-red-600" />
								<AlertTitle>Verification Denied</AlertTitle>
								<AlertDescription>
									Your previous verification document was rejected. Please upload a new
									document.
								</AlertDescription>
							</Alert>
						)}

						{user.profile?.verification_status === "pending" && (
							<Alert className="mt-4 bg-amber-50 border-amber-200">
								<Info className="h-4 w-4 text-amber-600" />
								<AlertTitle>Verification in Progress</AlertTitle>
								<AlertDescription>
									Your verification is currently being reviewed. This process typically
									takes 1-2 business days.
								</AlertDescription>
							</Alert>
						)}
					</div>

					{/* Current Document Display */}
					{user.profile?.verification_id && (
						<div className="mb-6">
							<h3 className="text-sm font-medium mb-2">
								Current Verification Document
							</h3>
							<div className="border border-gray-200 rounded-md p-4 flex items-center justify-center">
								<img
									src={user.profile.verification_id}
									alt="Verification Document"
									className="max-h-48 object-contain"
								/>
							</div>
						</div>
					)}

					{/* Upload Section */}
					<div
						className={`border-2 rounded-md p-6 ${
							user.profile?.verification_status === "denied"
								? "border-red-300 bg-red-50"
								: "border-dashed border-blue-300 bg-blue-50"
						}`}
					>
						<h3 className="text-lg font-medium mb-4">
							{user.profile?.verification_status === "approved"
								? "Replace Verification Document"
								: user.profile?.verification_id
								? "Update Verification Document"
								: "Upload Verification Document"}
						</h3>

						<p className="text-sm mb-4">
							{user.profile?.verification_status === "approved"
								? "Your organization is already verified. You can replace your verification document if needed."
								: "Please upload a business document, business license, or government ID to verify your organization."}
						</p>

						<CloudinaryUploader
							uploadPreset="organizers"
							className={`px-10 py-3 text-white rounded-md block w-full ${
								user.profile?.verification_status === "denied"
									? "bg-red-600 hover:bg-red-700"
									: "bg-blue-600 hover:bg-blue-700"
							}`}
							sources={["local", "url", "camera", "image_search"]}
							onSuccess={(result: any) => {
								if (result.info && result.info.secure_url) {
									const url = result.info.secure_url;
									handleVerificationUpload(url);
								} else {
									toast.error("Failed to upload verification document");
								}
							}}
							onError={(error: any) => {
								console.error("Upload error:", error);
								toast.error("Error uploading verification document");
							}}
						>
							<Upload className="inline-block mr-2 h-5 w-5" />
							{isVerificationLoading ? "Uploading..." : "Upload Verification Document"}
						</CloudinaryUploader>

						<p className="text-xs text-gray-600 mt-2">
							Accepted formats: PDF, JPG, PNG (max 5MB)
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default OrganizerProfilePage;
