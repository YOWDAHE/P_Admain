import axios from 'axios';
import axiosInstance from '@/lib/fetcher';

export interface UpdateOrganizerProfilePayload {
  name: string;
  description: string;
  logo_url: string;
  contact_phone: string;
  website_url: string;
  verification_id?: string;
  social_media_links: {
    facebook: string;
    twitter: string;
    instagram: string;
  } | null;
}

/**
 * Updates the organizer profile information
 * @param profileData The updated profile data
 * @param accessToken The access token for authorization
 * @returns A promise with the response data
 */
export const updateOrganizerProfile = async (
  profileData: UpdateOrganizerProfilePayload,
  accessToken: string
): Promise<{ success: boolean; data?: any; message: string }> => {
  try {
    if (!accessToken) {
      return { success: false, message: 'No access token available.' };
    }

    const response = await axiosInstance.patch(
      '/organizations/profile/',
      profileData,
    );

    return {
      success: true,
      data: response.data,
      message: 'Profile updated successfully.'
    };
  } catch (error) {
    console.error('Error updating organizer profile:', error);

    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message: `API Error: ${JSON.stringify(error.response.data)}`
      };
    }

    return {
      success: false,
      message: 'An error occurred while updating the profile.'
    };
  }
};