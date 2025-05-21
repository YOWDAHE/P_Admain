'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import PubNub from 'pubnub';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/hooks/use-auth';

// Define the shape of our PubNub context
interface PubNubContextType {
  pubnub: PubNub | null;
  isReady: boolean;
  currentChannel: string | null;
  setCurrentChannel: (channel: string | null) => void;
}

// Create the context
const PubNubContext = createContext<PubNubContextType>({
  pubnub: null,
  isReady: false,
  currentChannel: null,
  setCurrentChannel: () => {},
});

// Custom hook to use the PubNub context
export const usePubNub = () => useContext(PubNubContext);

interface PubNubProviderProps {
  children: React.ReactNode;
}

export const PubNubProvider: React.FC<PubNubProviderProps> = ({ children }) => {
  const [pubnub, setPubnub] = useState<PubNub | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentChannel, setCurrentChannel] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Only initialize PubNub if we have a user
    if (user) {
      // Create a unique ID for this user (could use user.id in production)
      const userId = user.id ? `user-${user.id}` : `user-${uuidv4()}`;
      
      // Initialize PubNub with the provided credentials
      const pubnubInstance = new PubNub({
        publishKey: 'pub-c-fe44933e-15ab-4f95-b926-a9a6897017db',
        subscribeKey: 'sub-c-0c1573c9-e0fb-400d-a8c7-7a032ec2bb90',
        uuid: userId,
        // We won't use secretKey in client-side code for security reasons
      });
      
      setPubnub(pubnubInstance);
      setIsReady(true);
    }
    
    // Cleanup function
    return () => {
      if (pubnub) {
        // Unsubscribe from all channels when component unmounts
        pubnub.unsubscribeAll();
      }
    };
  }, [user]);

  // If currentChannel changes, subscribe to the new channel
  useEffect(() => {
    if (pubnub && currentChannel) {
      // Subscribe to the channel
      pubnub.subscribe({
        channels: [currentChannel],
        withPresence: true // Enable presence to track who's online
      });
      
      // Unsubscribe from the channel when it changes or component unmounts
      return () => {
        if (pubnub && currentChannel) {
          pubnub.unsubscribe({
            channels: [currentChannel]
          });
        }
      };
    }
  }, [pubnub, currentChannel]);

  return (
    <PubNubContext.Provider
      value={{
        pubnub,
        isReady,
        currentChannel,
        setCurrentChannel
      }}
    >
      {children}
    </PubNubContext.Provider>
  );
}; 