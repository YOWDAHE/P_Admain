import { z } from "zod";

// User Schema (Attendees, Organizers, Admins)
export const UserSchema = z.object({
    user_id: z.string().uuid(),
    email: z.string().email(),
    password_hash: z.string().min(8),
    full_name: z.string().optional(),
    phone_number: z.string().optional(),
    role: z.enum(["attendee", "organizer", "admin"]),
    profile_picture_url: z.string().url().optional(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime()
});

// Organization Schema (Registered via Website)
export const OrganizationSchema = z.object({
    organization_id: z.string().uuid(),
    name: z.string().min(2),
    description: z.string().optional(),
    logo_url: z.string().url().optional(),
    contact_email: z.string().email(),
    contact_phone: z.string().optional(),
    website_url: z.string().url().optional(),
    social_media_links: z.record(z.string(), z.string()).optional(),
    created_by_user_id: z.string().uuid(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime()
});
// status: z.enum(["pending", "approved", "rejected"]).default("pending"),

export const Category = z.object({
    category_id: z.string().uuid(),
    name: z.string().min(2),
    description: z.string().optional(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime()
})

// Event Schema
export const EventSchema = z.object({
    event_id: z.string().uuid(),
    title: z.string().min(2),
    description: z.string(),
    category: z.array(Category),
    start_time: z.string().datetime(),
    end_time: z.string().datetime(),
    start_date: z.string().datetime(),
    end_date: z.string().datetime(),
    location: z.string(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    cover_image_url: z.string().url().optional(),
    organizer_id: z.string().uuid(),
    is_public: z.boolean().default(true),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime()
});

// Ticket Schema
export const TicketSchema = z.object({
    ticket_id: z.string().uuid(),
    event_id: z.string().uuid(),
    name: z.string().min(2),
    price: z.number().positive(),
    valid_from: z.string().datetime().optional(),
    valid_until: z.string().datetime().optional(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime()
});
// quantity_available: z.number().int().nonnegative(),

// Event Registration Schema
export const EventRegistrationSchema = z.object({
    registration_id: z.string().uuid(),
    event_id: z.string().uuid(),
    user_id: z.string().uuid(),
    ticket_id: z.string().uuid().optional(),
    registration_time: z.string().datetime(),
    status: z.enum(["registered", "cancelled"]).default("registered")
});

// Follower Schema (Users following Organizations)
export const FollowerSchema = z.object({
    organization_id: z.string().uuid(),
    user_id: z.string().uuid(),
    followed_at: z.string().datetime()
});

// Transaction Schema
export const TransactionSchema = z.object({
    transaction_id: z.string().uuid(),
    user_id: z.string().uuid().optional(),
    event_id: z.string().uuid().optional(),
    amount: z.number().positive(),
    payment_gateway: z.enum(["telebirr", "chapa", "other"]),
    gateway_transaction_id: z.string(),
    status: z.enum(["pending", "completed", "failed", "refunded"]),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime()
});

// Notification Schema
export const NotificationSchema = z.object({
    notification_id: z.string().uuid(),
    user_id: z.string().uuid(),
    type: z.enum(["event_reminder", "registration_confirmation", "new_event"]),
    message: z.string(),
    is_read: z.boolean().default(false),
    created_at: z.string().datetime()
});

// Review Schema
export const ReviewSchema = z.object({
    review_id: z.string().uuid(),
    user_id: z.string().uuid(),
    organization_id: z.string().uuid().optional(),
    event_id: z.string().uuid().optional(),
    rating: z.number().int().min(1).max(5),
    comment: z.string().optional(),
    created_at: z.string().datetime()
});

// Export all schemas
export type User = z.infer<typeof UserSchema>;
export type Organization = z.infer<typeof OrganizationSchema>;
export type Event = z.infer<typeof EventSchema>;
export type Ticket = z.infer<typeof TicketSchema>;
export type EventRegistration = z.infer<typeof EventRegistrationSchema>;
export type Follower = z.infer<typeof FollowerSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type Notification = z.infer<typeof NotificationSchema>;
export type Review = z.infer<typeof ReviewSchema>;