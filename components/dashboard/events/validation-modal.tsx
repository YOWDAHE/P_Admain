"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  validationResult: {
    success: boolean;
    isEventRelated: boolean;
    confidence: number;
    message: string;
  } | null;
  isValidating: boolean;
}

export default function ValidationModal({
  isOpen,
  onClose,
  validationResult,
  isValidating,
}: ValidationModalProps) {
  // Early return if no validation result and not validating
  if (!validationResult && !isValidating) return null;

  // Determine icon and title based on validation result
  let icon = <AlertTriangle className="h-6 w-6 text-yellow-500" />;
  let title = "Validation Result";
  let titleColor = "text-yellow-700";

  if (validationResult) {
    if (validationResult.isEventRelated) {
      icon = <CheckCircle className="h-6 w-6 text-green-500" />;
      title = "Valid Event Description";
      titleColor = "text-green-700";
    } else {
      icon = <XCircle className="h-6 w-6 text-red-500" />;
      title = "Not an Event Description";
      titleColor = "text-red-700";
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-4">
            {icon}
            <DialogTitle className={titleColor}>{title}</DialogTitle>
          </div>
        </DialogHeader>

        {isValidating ? (
          <div className="py-6 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-slate-600">Analyzing your event description...</p>
          </div>
        ) : (
          validationResult && (
            <>
              <div className="border rounded-md p-4 bg-slate-50">
                <div className="flex items-center mb-2">
                  <div 
                    className={`h-3 w-3 rounded-full mr-2 ${
                      validationResult.isEventRelated ? 'bg-green-500' : 'bg-red-500'
                    }`} 
                  />
                  {/* <span className="font-medium">
                    Confidence: {Math.round(validationResult.confidence * 100)}%
                  </span> */}
                </div>
                <p className="text-slate-700">{validationResult.message}</p>
              </div>

              <DialogDescription className="mt-2 text-center">
                {validationResult.isEventRelated
                  ? "Your description appears to be event-related. You can proceed with event creation."
                  : "Please update your description to include more event-related details like date, time, venue, and purpose of the event."}
              </DialogDescription>

              <DialogFooter className="mt-4">
                <Button 
                  variant={validationResult.isEventRelated ? "default" : "outline"} 
                  onClick={onClose} 
                  className="w-full"
                >
                  {validationResult.isEventRelated ? "Continue" : "Update Description"}
                </Button>
              </DialogFooter>
            </>
          )
        )}
      </DialogContent>
    </Dialog>
  );
} 