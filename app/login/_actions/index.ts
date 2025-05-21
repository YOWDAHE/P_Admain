import { OrganizersSchema, OrganizerType, VerifiedOrganizer } from "@/app/models/Organizers";
import { useRouter } from "next/navigation"; // Import useRouter

const BASE_URL = process.env.BASE_URL;

export async function registerOrganizer(data: OrganizerType) {
    try {
        const validatedData = OrganizersSchema.parse(data);

        const response = await fetch(`https://www.mindahun.pro.et/api/v1/auth/organization/register/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(validatedData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to register organizer");
        }

        return await response.json();
    } catch (error: any) {
        console.error("Error registering organizer:", error);
        throw new Error(error.message || "An unexpected error occurred");
    }
}

export async function verifyEmail(email: string, otp: string): Promise<VerifiedOrganizer> {

    try {
        const response = await fetch(`https://www.mindahun.pro.et/api/v1/auth/email/verify/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, otp }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to verify email");
        }

        const verifiedOrganizer: VerifiedOrganizer = await response.json();

        return verifiedOrganizer;
    } catch (error: any) {
        console.error("Error verifying email:", error);
        throw new Error(error.message || "An unexpected error occurred");
    }
}

export async function login(email: string, password: string): Promise<VerifiedOrganizer> {
    try {
        const response = await fetch(`https://www.mindahun.pro.et/api/v1/auth/login/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            
            if (errorData.error) {
                throw new Error(JSON.stringify(errorData));
            }
            throw new Error(errorData.message || "Failed to log in");
        }

        const verifiedOrganizer: VerifiedOrganizer = await response.json();

        return verifiedOrganizer;
    } catch (error: any) {
        console.error("Error logging in:", error);
        throw error;
    }
}

