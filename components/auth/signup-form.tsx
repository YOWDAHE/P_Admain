"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { EmailVerification } from "./email-verification";
import { IdVerification } from "./id-verification";
import { registerOrganizer } from "@/app/login/_actions";
import { CloudinaryUploader } from "@/components/cloudinary-uploader";
import {
	OrganierSuccessResponseType,
	OrganizerResponseType,
} from "@/app/models/Organizers";
import { updateOrganizerProfile } from "@/actions/organizer.action";

export function SignUpForm() {
	const [organizationName, setOrganizationName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showVerification, setShowVerification] = useState(false);
	const [showIdVerification, setShowIdVerification] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
	const [organizerId, setOrganizerId] = useState<number | null>(null);
	const [organizerData, setOrganizerData] = useState<OrganierSuccessResponseType | null>(null);
	const router = useRouter();
	const { toast } = useToast();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			if (password !== confirmPassword) {
				throw new Error("Passwords do not match");
			}

			if (password.length < 8) {
				throw new Error("Password must be at least 8 characters long");
			}

			const data = {
				email,
				password,
				name: organizationName,
				description: "Organization description",
				contact_phone: phone,
				website_url: "https://example.com",
				social_media_links: {
					facebook: "",
					twitter: "",
					instagram: "",
				},
				logo_url: profilePhoto || "",
			};

			const resp: OrganizerResponseType = await registerOrganizer(data);

			if (isOrganierSuccessResponseType(resp)) {
				setOrganizerId(resp.user.id);
				setOrganizerData(resp); // Store the full response
				setShowVerification(true);
			}

			toast({
				title: "Success",
				description: "Account created successfully. Please check your email for verification.",
			});
		} catch (error: any) {
			console.error("Error creating account:", error);
			toast({
				title: "Error",
				description: error.message || "Failed to create account. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	const handleBackToLogin = () => {
		setOrganizationName("");
		setEmail("");
		setPhone("");
		setPassword("");
		setConfirmPassword("");
		setShowVerification(false);
		setShowIdVerification(false);
		setOrganizerData(null);

		const loginTab = document.querySelector(
			'[data-state="inactive"][data-value="login"]'
		);
		if (loginTab instanceof HTMLElement) {
			loginTab.click();
		}
	};
	
	const handleEmailVerified = () => {
		setShowVerification(false);
		setShowIdVerification(true);
	};
	
	const handleIdVerificationComplete = async (verificationId: string) => {
		try {
			if (!organizerData?.user?.profile) {
				throw new Error("Organization data is missing");
			}

			// Update the organization profile with the verification ID
			const { profile } = organizerData.user;
			const updateResp = await updateOrganizerProfile({
				name: profile.name,
				description: profile.description,
				logo_url: profile.logo_url,
				contact_phone: profile.contact_phone,
				website_url: profile.website_url,
				verification_id: verificationId,
				social_media_links: profile.social_media_links,
			});

			if (updateResp.success) {
				toast({
					title: "Success",
					description: "Verification document uploaded successfully!",
				});
				router.push("/dashboard");
			} else {
				throw new Error(updateResp.message);
			}
		} catch (error: any) {
			console.error("Error updating verification:", error);
			toast({
				title: "Error",
				description: error.message || "Failed to update verification. You can complete this step later in settings.",
				variant: "destructive",
			});
			// Still redirect to dashboard even if verification update fails
			router.push("/dashboard");
		}
	};

	if (showIdVerification && organizerId) {
		return (
			<IdVerification 
				email={email} 
				organizerId={organizerId} 
				onComplete={handleIdVerificationComplete} 
			/>
		);
	}

	if (showVerification) {
		return (
			<EmailVerification 
				email={email} 
				onBackToLogin={handleBackToLogin} 
				onVerified={handleEmailVerified}
			/>
		);
	}

	return (
		<Card>
			<CardContent className="pt-6">
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="organizationName">Organization Name</Label>
						<Input
							id="organizationName"
							value={organizationName}
							onChange={(e) => setOrganizationName(e.target.value)}
							placeholder="Your organization name"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="your.email@example.com"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="phone">Phone Number</Label>
						<Input
							id="phone"
							type="tel"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							placeholder="+1 (555) 123-4567"
							required
						/>
					</div>

					<CloudinaryUploader
						uploadPreset="organizers"
						sources={["local", "url", "image_search"]}
						className=" px-10 py-2 text-black text-sm rounded-sm block border-gray-300 border-2 w-full"
						onSuccess={(e) => {
							if (e.info && e.info.secure_url) {
								const url = e.info.secure_url;
								toast({
									title: "Success",
									description: "Image uploaded successfully",
								});
								setProfilePhoto(url);
							} else {
								toast({
									title: "Error",
									description: "Failed to upload image",
									variant: "destructive",
								});
							}
						}}
						onError={(e) => {
							console.error(e);
						}}
					>
						Upload Profile Photo
					</CloudinaryUploader>

					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="••••••••"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="confirmPassword">Confirm Password</Label>
						<Input
							id="confirmPassword"
							type="password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							placeholder="••••••••"
							required
						/>
					</div>

					<Button type="submit" className="w-full" disabled={isLoading}>
						{isLoading ? "Creating account..." : "Continue"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}

function isOrganierSuccessResponseType(
	resp: OrganizerResponseType
): resp is OrganierSuccessResponseType {
	return (
		(resp as OrganierSuccessResponseType).message !== undefined &&
		(resp as OrganierSuccessResponseType).user !== undefined
	);
}
