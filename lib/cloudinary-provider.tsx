"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

// Context to track if Cloudinary is initialized and ready
const CloudinaryContext = createContext<{ isReady: boolean }>({ isReady: false });

export const useCloudinary = () => useContext(CloudinaryContext);

// Helper to check if we're in browser environment
const isBrowser = () => typeof window !== 'undefined';

export function CloudinaryProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isBrowser()) return;

    // Check if Cloudinary script is already loaded
    if (document.getElementById('cloudinary-script')) {
      setIsReady(true);
      return;
    }

    // Function to initialize Cloudinary widget script
    const initCloudinary = () => {
      const script = document.createElement('script');
      script.id = 'cloudinary-script';
      script.src = 'https://upload-widget.cloudinary.com/global/all.js';
      script.async = true;
      script.onload = () => {
        setIsReady(true);
      };
      document.body.appendChild(script);
    };

    // Initialize Cloudinary
    initCloudinary();

    // Cleanup function
    return () => {
      const script = document.getElementById('cloudinary-script');
      if (script) {
        script.remove();
      }
    };
  }, []);

  return (
    <CloudinaryContext.Provider value={{ isReady }}>
      {children}
    </CloudinaryContext.Provider>
  );
} 