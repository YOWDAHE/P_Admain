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
import { CldUploadButton } from "next-cloudinary";

const OrganizerProfilePage = () => {
	const { user, getAccessToken, updateUser } = useAuth();
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const [formData, setFormData] = useState<UpdateOrganizerProfilePayload>({
		name: user?.profile?.name || "",
		description: user?.profile?.description || "",
		logo_url: user?.profile?.logo_url || "",
		contact_phone: user?.profile?.contact_phone || "",
		website_url: user?.profile?.website_url || "",
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
					social_media_links: socialMediaLinks,
				};

				updateUser({
					...user,
					profile: updatedProfile,
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
			<div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
				{/* Header */}
				<div className="bg-blue-600 text-white p-6 flex items-center justify-between">
					<div className="flex items-center">
						<img
							src={user.profile?.logo_url || "/placeholder-logo.png"}
							alt={`${user.profile?.name || "Organization"} Logo`}
							className="w-20 h-20 rounded-full object-cover mr-6"
						/>
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
										<CldUploadButton
											uploadPreset="organizers"
											className="px-10 py-2 text-black text-sm rounded-sm block border-gray-300 border-2 w-full hover:bg-gray-50"
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
										>
											{formData.logo_url ? "Change Logo" : "Upload Logo"}
										</CldUploadButton>
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
						{/* {user.profile?.website_url ? (
							<a
								href={user.profile.website_url}
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-600 underline"
							>
								{user.profile.website_url}
							</a>
						) : (
							"No website provided"
						)} */}
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
		</div>
	);
};

export default OrganizerProfilePage;
