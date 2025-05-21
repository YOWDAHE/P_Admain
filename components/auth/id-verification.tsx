"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
	CardFooter,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { CldUploadButton } from "next-cloudinary";
import { Shield, AlertTriangle } from "lucide-react";
import { updateOrganizerVerification } from "@/actions/auth";

interface IdVerificationProps {
	email: string;
	organizerId: number;
	onComplete: () => void;
}

export function IdVerification({
	email,
	organizerId,
	onComplete,
}: IdVerificationProps) {
	const [idDocument, setIdDocument] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showSkipWarning, setShowSkipWarning] = useState(false);
	const { toast } = useToast();
	const router = useRouter();

	const handleSubmitVerification = async () => {
		if (!idDocument) {
			toast({
				title: "Error",
				description: "Please upload an identification document",
				variant: "destructive",
			});
			return;
		}

		setIsSubmitting(true);

		try {
			// await updateOrganizerVerification(organizerId, idDocument, true);

			toast({
				title: "Verification Submitted",
				description: "Your identification has been submitted for verification.",
			});

			onComplete();
			router.push("/dashboard");
		} catch (error: any) {
			toast({
				title: "Error",
				description:
					error.message || "Failed to submit verification. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSkip = () => {
		setShowSkipWarning(true);
	};

	const confirmSkip = async () => {
		setIsSubmitting(true);

		try {
			// Update user as unverified
			await updateOrganizerVerification(organizerId, null, false);

			setShowSkipWarning(false);
			onComplete();
			router.push("/dashboard");
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.message || "Failed to update verification status.",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<>
			<Card className="w-full max-w-md mx-auto">
				<CardHeader>
					<div className="flex items-center justify-center mb-4">
						<div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
							<Shield className="h-6 w-6 text-blue-600" />
						</div>
					</div>
					<CardTitle className="text-center">Verify Your Identity</CardTitle>
					<CardDescription className="text-center">
						Upload a government-issued ID to verify your identity and create public
						events.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="idUpload">Upload Identification</Label>
						<div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
							{idDocument ? (
								<div className="relative w-full h-48 mb-4">
									<Image
										src={idDocument}
										alt="ID Document"
										fill
										sizes="100%"
										className="object-contain"
									/>
									<Button
										variant="destructive"
										size="sm"
										className="absolute top-2 right-2"
										onClick={() => setIdDocument(null)}
									>
										Remove
									</Button>
								</div>
							) : (
								<div className="text-center">
									<p className="text-sm text-gray-500 mb-4">
										Upload a clear photo of your ID card, National ID, passport, or driver's license
									</p>
									<CldUploadButton
										uploadPreset="id_documents"
										className="bg-blue-500 px-6 py-2 text-white rounded-md"
										onSuccess={(result) => {
											if (
												result.info &&
												typeof result.info === "object" &&
												"secure_url" in result.info
											) {
												const url = result.info.secure_url as string;
												setIdDocument(url);
												toast({
													title: "Success",
													description: "Document uploaded successfully",
												});
											}
										}}
										onError={(error) => {
											console.error("Upload error:", error);
											toast({
												title: "Error",
												description: "Failed to upload document. Please try again.",
												variant: "destructive",
											});
										}}
										options={{
											maxFiles: 1,
											resourceType: "image",
										}}
									>
										{isUploading ? "Uploading..." : "Upload ID Document"}
									</CldUploadButton>
								</div>
							)}
						</div>
					</div>
				</CardContent>
				<CardFooter className="flex flex-col space-y-2">
					<Button
						onClick={handleSubmitVerification}
						className="w-full"
						disabled={!idDocument || isSubmitting}
					>
						{isSubmitting ? "Processing..." : "Continue with Verification"}
					</Button>
					<Button
						variant="outline"
						onClick={handleSkip}
						className="w-full"
						disabled={isSubmitting}
					>
						Skip for Now
					</Button>
				</CardFooter>
			</Card>

			{/* Skip Verification Warning Dialog */}
			<Dialog open={showSkipWarning} onOpenChange={setShowSkipWarning}>
				<DialogContent>
					<DialogHeader>
						<div className="flex items-center gap-2">
							<AlertTriangle className="h-5 w-5 text-amber-500" />
							<DialogTitle>Skip Verification?</DialogTitle>
						</div>
						<DialogDescription>
							Without identity verification, you won't be able to create public events
							on our platform. You can always complete verification later from your
							account settings.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="flex flex-col sm:flex-row gap-2">
						<Button
							variant="outline"
							onClick={() => setShowSkipWarning(false)}
							className="sm:flex-1"
						>
							Go Back
						</Button>
						<Button
							variant="default"
							onClick={confirmSkip}
							className="sm:flex-1"
							disabled={isSubmitting}
						>
							{isSubmitting ? "Processing..." : "Skip Anyway"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
