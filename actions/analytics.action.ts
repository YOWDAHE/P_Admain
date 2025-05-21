import axiosInstance from '@/lib/fetcher';
import { AnalyticsData } from '@/app/models/analytics';

export const fetchOrganizationAnalytics = async (organizationId: number): Promise<AnalyticsData> => {
  try {
    const response = await axiosInstance.get<AnalyticsData>(`/organizations/analytics/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw new Error('Failed to fetch analytics data');
  }
};
