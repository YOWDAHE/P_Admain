"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import CldUploadButton with ssr: false
const DynamicCldUploadButton = dynamic(
  () => import("next-cloudinary").then((mod) => mod.CldUploadButton),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-4 border border-dashed rounded-md">
        <div className="animate-pulse text-center">
          <div className="text-sm text-gray-500">Loading uploader...</div>
        </div>
      </div>
    ),
  }
);

// Define the allowed source types based on Cloudinary's options
type CloudinarySourceType = 
  | "local" 
  | "url" 
  | "camera" 
  | "image_search" 
  | "dropbox" 
  | "facebook" 
  | "gettyimages" 
  | "google_drive" 
  | "instagram" 
  | "istock" 
  | "shutterstock" 
  | "unsplash";

interface CloudinaryUploaderProps {
  children: React.ReactNode;
  uploadPreset: string;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
  className?: string;
  sources?: CloudinarySourceType[]; // Use the correct type
  [x: string]: any; 
}

export function CloudinaryUploader({
  children,
  uploadPreset,
  onSuccess,
  onError,
  className,
  sources = ["local", "url", "camera", "image_search"], // Default sources
  ...props
}: CloudinaryUploaderProps) {
  // Set initial loading state
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);

  useEffect(() => {
    // Monitor for the iframe appearance
    const iframeObserver = new MutationObserver((mutations, observer) => {
      const cloudinaryIframe = document.querySelector('iframe[data-test="uw-iframe"]');
      if (cloudinaryIframe && !isIframeLoaded) {
        setIsIframeLoaded(true);
        document.body.classList.add("cld-upload-modal-open");
        (cloudinaryIframe as HTMLElement).focus();
      } else if (!cloudinaryIframe && isIframeLoaded) {
        setIsIframeLoaded(false);
        document.body.classList.remove("cld-upload-modal-open");
      }
    });

    iframeObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      // Clean up
      iframeObserver.disconnect();
      document.body.classList.remove("cld-upload-modal-open");
    };
  }, [isIframeLoaded]);

  const handleClick = (e: React.MouseEvent) => {
    // Pre-initialize body class for smoother appearance
    document.body.classList.add("cld-upload-modal-preparing");

    // Add a small delay to ensure any competing event handlers have completed
    setTimeout(() => {
      // Force focus to the Cloudinary iframe once it's opened
      const cloudinaryIframe = document.querySelector('iframe[data-test="uw-iframe"]');
      if (cloudinaryIframe) {
        (cloudinaryIframe as HTMLElement).focus();
      }
    }, 500);
  };

  const handleSuccessWrapper = (result: any) => {
    // Remove modal classes
    document.body.classList.remove("cld-upload-modal-preparing");
    
    // Call the original onSuccess handler
    if (onSuccess) {
      onSuccess(result);
    }
  };

  const handleErrorWrapper = (error: any) => {
    // Remove modal classes
    document.body.classList.remove("cld-upload-modal-preparing");
    
    // Call the original onError handler
    if (onError) {
      onError(error);
    }
  };

  return (
    <DynamicCldUploadButton
      uploadPreset={uploadPreset}
      className={className}
      onSuccess={handleSuccessWrapper}
      onError={handleErrorWrapper}
      onClick={handleClick}
      options={{
        sources: sources,
      }}
      {...props}
    >
      {children}
    </DynamicCldUploadButton>
  );
} 