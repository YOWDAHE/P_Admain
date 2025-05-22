'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { fetchOrganizationAnalytics } from '@/actions/analytics.action';
import { AnalyticsContent } from './analytics-content';
import { AnalyticsData } from '@/app/models/analytics';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info } from "lucide-react";
import { VerificationAlert } from "@/components/dashboard/verification-alert";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function AnalyticsWrapper() {
  const { user } = useAuth();
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVerificationError, setIsVerificationError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) {
        setError('Please log in to view analytics');
        setLoading(false);
        return;
      }

      try {
        const response = await fetchOrganizationAnalytics(user.id);
        
        if (response.success && response.data) {
          setAnalyticsData(response.data);
          setError(null);
          setIsVerificationError(false);
        } else if (response.isVerificationError) {
          // Handle verification error
          setIsVerificationError(true);
          setAnalyticsData(null);
          setError(null);
        } else if (response.error) {
          // Handle general error
          setError(response.error);
          setAnalyticsData(null);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data. Please try again later.');
        setAnalyticsData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <div className="flex items-center justify-center h-[300px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (isVerificationError) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        
        {/* Verification Status Alert */}
        {user?.profile && (
          <VerificationAlert verificationStatus={user.profile.verification_status} />
        )}
        
        <Alert className="border-yellow-500 bg-yellow-50">
          <Info className="h-5 w-5 text-yellow-500" />
          <AlertTitle>Analytics Not Available</AlertTitle>
          <AlertDescription>
            <p className="mb-4">
              Analytics are only available for non verified organizations. Complete the verification 
              process to access detailed analytics for your events.
            </p>
            <Button 
              variant="outline"
              onClick={() => router.push('/dashboard/settings')}
              className="bg-white hover:bg-yellow-100 border-yellow-400 text-yellow-700"
            >
              Go to Settings to Verify
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Data</AlertTitle>
          <AlertDescription>No analytics data is available at the moment.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return <AnalyticsContent analyticsData={analyticsData} />;
} 