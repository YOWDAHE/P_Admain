import axiosInstance from '@/lib/fetcher';
import { AnalyticsData } from '@/app/models/analytics';
import axios from 'axios';

export interface AnalyticsResponse {
  data: AnalyticsData | null;
  success: boolean;
  error: string | null;
  isVerificationError: boolean;
}

export const fetchOrganizationAnalytics = async (organizationId: number): Promise<AnalyticsResponse> => {
  try {
    const response = await axiosInstance.get<AnalyticsData>(`/organizations/analytics/`);
    return {
      data: response.data,
      success: true,
      error: null,
      isVerificationError: false
    };
  } catch (error) {
    console.error('Error fetching analytics:', error);
    
    // Check if it's a verification error
    if (axios.isAxiosError(error) && error.response) {
      const responseData = error.response.data;
      
      // Check for the specific verification error message
      if (responseData && responseData.detail === "Your organization profile is not approved yet.") {
        return {
          data: null,
          success: false,
          error: "Analytics are only available for verified organizations.",
          isVerificationError: true
        };
      }
      
      return {
        data: null,
        success: false,
        error: responseData.detail || 'Failed to fetch analytics data',
        isVerificationError: false
      };
    }
    
    return {
      data: null,
      success: false,
      error: 'Failed to fetch analytics data',
      isVerificationError: false
    };
  }
};
