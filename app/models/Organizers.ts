import { z } from "zod";

export const SocialMediaLinksSchema = z.object({
    facebook: z.string(),
    twitter: z.string(),
    instagram: z.string(),
});

export const OrganizersSchema = z.object({
    email: z.string().email(),
    username: z.string().optional(),
    password: z.string(),
    name: z.string(),
    description: z.string().optional(),
    contact_phone: z.string().optional(),
    website_url: z.string().url().optional(),
    social_media_links: SocialMediaLinksSchema.optional(),
    logo_url: z.string().url().optional(),
});

export type OrganizerResponseType = OrganierSuccessResponseType | { "email"?: String[], "password"?: String[], "name"?: String[] };

export interface OrganierSuccessResponseType {
    message: string;
    user: Organization;
}

export interface Organization {
    id: number;
    email: string;
    role: string;
    username: string;
    profile: Profile;
}


export interface Profile {
    id: number;
    name: string;
    description: string;
    logo_url: string;
    contact_phone: string;
    website_url: string;
    social_media_links: SocialMediaLinks;
    created_at: Date;
    updated_at: Date;
    user: number;
}

export interface SocialMediaLinks {
    facebook: string;
    twitter: string;
    instagram: string;
}


export interface VerifiedOrganizer {
    message: string;
    tokens:  Tokens;
    user:    User;
}

export interface Tokens {
    refresh: string;
    access:  string;
}

export interface User {
    id:       number;
    email:    string;
    role:     string;
    username: string;
    profile:  Profile;
}

export interface Profile {
    id:                 number;
    name:               string;
    description:        string;
    logo_url:           string;
    contact_phone:      string;
    website_url:        string;
    social_media_links: SocialMediaLinks;
    created_at:         Date;
    updated_at:         Date;
    user:               number;
}

export interface SocialMediaLinks {
    twitter:   string;
    facebook:  string;
    instagram: string;
}




export type SocialMediaLinksType = z.infer<typeof SocialMediaLinksSchema>;
export type OrganizerType = z.infer<typeof OrganizersSchema>;
