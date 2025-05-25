import axios from 'axios';

const BASE_URL = process.env.NEXT_BASE_URL;

export async function refreshToken(refresh: string): Promise<void> {
    try {
        console.log('Refreshing token...');
        const response = await axios.post(`https://www.mindahun.pro.et/api/v1/auth/token/refresh/`, {
            refresh,
        });

        if (response.data && response.data.access) {
            console.log('New access token:', response.data);
            localStorage.setItem('accessToken', response.data.access);
        } else {
            console.error('No access token found in the response.');
        }
    } catch (error) {
        console.error('Error refreshing token:', error);
    }
}

export const resendOtp = async (email: string): Promise<string> => {
    try {
        const response = await axios.post(`https://www.mindahun.pro.et/api/v1/auth/otp/resend/`, { email });

        if (response.data && response.data.message) {
            console.log("OTP resent successfully:", response.data.message);
            return response.data.message;
        } else {
            throw new Error("Unexpected response format");
        }
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            const apiErrors = error.response.data;
            console.error("API validation errors:", apiErrors);
            throw new Error(JSON.stringify(apiErrors));
        } else if (error instanceof Error) {
            console.error("Validation or runtime error:", error.message);
            throw error;
        } else {
            console.error("Unexpected error:", error);
            throw error;
        }
    }
};

export async function updateOrganizerVerification(
  organizerId: number,
  idDocumentUrl: string | null,
  isVerificationAttempted: boolean
): Promise<any> {
  try {
    const response = await fetch(`https://www.mindahun.pro.et/api/v1/organizers/${organizerId}/verify`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id_document_url: idDocumentUrl,
        verification_attempted: isVerificationAttempted,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update verification status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating organizer verification:', error);
    throw error;
  }
}