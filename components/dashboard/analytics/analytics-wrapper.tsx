'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { fetchOrganizationAnalytics } from '@/actions/analytics.action';
import { AnalyticsContent } from './analytics-content';
import { AnalyticsData } from '@/app/models/analytics';

export function AnalyticsWrapper() {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!user) {
        setError('Please log in to view analytics');
        return;
      }

      try {
        const data = await fetchOrganizationAnalytics(user.id);
          setAnalyticsData(data);
          setError(null);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data. Please try again later.');
      }
    }

    fetchData();
  }, [user]);

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  return <AnalyticsContent analyticsData={analyticsData} />;
} 