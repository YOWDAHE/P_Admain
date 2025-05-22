"use client";

import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface VerificationAlertProps {
  verificationStatus: string;
}

export function VerificationAlert({ verificationStatus }: VerificationAlertProps) {
  const router = useRouter();

  if (verificationStatus === "approved") {
    return null;
  }

  let title = "";
  let description = "";
  let icon = null;
  let color = "";

  switch (verificationStatus) {
    case "pending":
      title = "Verification Pending";
      description = "Your account is not verified yet. If you haven't uploaded legal document please do so.";
      icon = <Clock className="h-5 w-5 text-yellow-500" />;
      color = "border-yellow-500 bg-yellow-50";
      break;
    case "denied":
      title = "Verification Denied";
      description = "Your account verification was denied. Please update your verification documents and submit again.";
      icon = <AlertCircle className="h-5 w-5 text-red-500" />;
      color = "border-red-500 bg-red-50";
      break;
    default:
      title = "Verification Required";
      description = "Please verify your account to access all features. Upload a valid ID or business document in settings.";
      icon = <AlertCircle className="h-5 w-5 text-blue-500" />;
      color = "border-blue-500 bg-blue-50";
  }

  return (
    <Alert className={`mb-6 ${color}`}>
      <div className="flex items-start">
        <div className="mr-3 mt-0.5">{icon}</div>
        <div className="flex-1">
          <AlertTitle className="text-base font-medium">{title}</AlertTitle>
          <AlertDescription className="mt-1">{description}</AlertDescription>
          
          {verificationStatus !== "pending" && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => router.push("/dashboard/settings")}
            >
              Go to Settings
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
} 