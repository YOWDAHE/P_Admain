"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Mail, CheckCircle, RefreshCw } from "lucide-react";
import { verifyEmail } from "@/app/login/_actions";
import { useAuth } from "@/hooks/use-auth";
import { resendOtp } from "@/actions/auth";
import { useRouter } from "next/navigation";

interface EmailVerificationProps {
	email: string;
	onBackToLogin: () => void;
	onVerified?: () => void;
}

export function EmailVerification({
	email,
	onBackToLogin,
	onVerified,
}: EmailVerificationProps) {
	const [verificationCode, setVerificationCode] = useState("");
	const [isVerifying, setIsVerifying] = useState(false);
	const [isResending, setIsResending] = useState(false);
	const [isVerified, setIsVerified] = useState(false);
	const { toast } = useToast();
	const { login } = useAuth();
	const router = useRouter();

	const handleResend = async () => {
		setIsResending(true);

		try {
			await resendOtp(email);

			toast({
				title: "Code resent",
				description: "A new verification code has been sent to your email.",
			});
		} catch (error: any) {
			toast({
				title: "Error",
				description: error.message || "Failed to resend code. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsResending(false);
		}
	};

	const handleVerify = async (e: React.FormEvent) => {
		console.log("Verifying email with code: ", verificationCode);
		e.preventDefault();
		setIsVerifying(true);

		try {
			const verifiedOrganizer = await verifyEmail(email, verificationCode);

			if (!verifiedOrganizer) {
				throw new Error("Verification failed. Please try again.");
			}

			login(verifiedOrganizer);

			setIsVerified(true);

			toast({
				title: "Email verified",
				description:
					"Your email has been verified successfully. Proceeding to ID verification.",
			});

			setTimeout(() => {
				if (onVerified) {
					onVerified();
				} else {
					router.push("/dashboard");
				}
			}, 1000);
		} catch (error: any) {
			console.error("Error verifying email:", error);
			toast({
				title: "Verification failed",
				description: error.message || "Failed to verify email. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsVerifying(false);
		}
	};

	if (isVerified) {
		return (
			<Card>
				<CardContent className="pt-6 flex flex-col items-center justify-center text-center">
					<div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
						<CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
					</div>
					<h3 className="text-xl font-semibold mb-2">Email Verified!</h3>
					<p className="text-muted-foreground mb-4">
						Your email has been verified successfully. You will be redirected to login
						shortly.
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Verify your email</CardTitle>
				<CardDescription>
					We've sent a verification code to{" "}
					<span className="font-medium">{email}</span>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex justify-center mb-6">
					<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
						<Mail className="h-6 w-6 text-primary" />
					</div>
				</div>

				<form onSubmit={handleVerify} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="verificationCode">Verification Code</Label>
						<Input
							id="verificationCode"
							value={verificationCode}
							onChange={(e) => setVerificationCode(e.target.value)}
							placeholder="Enter 6-digit code"
							maxLength={6}
							required
						/>
					</div>

					<Button type="submit" className="w-full" disabled={isVerifying}>
						{isVerifying ? "Verifying..." : "Verify Email"}
					</Button>
				</form>

				<div className="mt-4 flex flex-col space-y-4">
					<div className="text-sm text-center">
						<span className="text-muted-foreground">Didn't receive a code? </span>
						<Button
							variant="link"
							className="p-0 h-auto font-normal"
							onClick={handleResend}
							disabled={isResending}
						>
							{isResending ? (
								<>
									<RefreshCw className="h-3 w-3 mr-1 animate-spin" />
									Resending...
								</>
							) : (
								"Resend Code"
							)}
						</Button>
					</div>

					<Button variant="ghost" className="w-full" onClick={onBackToLogin}>
						Back to Login
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
