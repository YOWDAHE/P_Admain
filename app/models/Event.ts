import { z } from 'zod';

// Profile schema for event organizer
const ProfileSchema = z.object({
  id: z.number(),
  is_following: z.boolean().optional(),
  name: z.string(),
  description: z.string().nullable().optional(),
  logo_url: z.string().nullable().optional(),
  contact_phone: z.string().nullable().optional(),
  website_url: z.string().url().nullable().optional(),
  social_media_links: z.any().nullable().optional(),
  created_at: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
  updated_at: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
  user: z.number()
});

// User schema for organizer and rating user
const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  role: z.string(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  date_joined: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
  username: z.string(),
  profile: z.union([ProfileSchema, z.string()])
});

// Organizer schema
const OrganizerSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  role: z.string(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  date_joined: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
  username: z.string(),
  profile: ProfileSchema
});

// Rating schema
const RatingSchema = z.object({
  id: z.number(),
  user: UserSchema,
  value: z.number().min(0).max(5),
  comment: z.string().nullable().optional(),
  created_at: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
  updated_at: z.string().datetime({ message: "Invalid ISO 8601 datetime format" })
});

// Hashtag schema
const HashtagSchema = z.object({
  name: z.string()
});

// Schema for event creation request
export const EventCreationSchema = z.object({
  category: z.array(z.number()),
  title: z.string(),
  description: z.string(),
  start_time: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
  end_time: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
  start_date: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
  end_date: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
  location: z.string(),
  latitude: z.number().min(-90).max(90, { message: "Latitude must be between -90 and 90" }),
  longitude: z.number().min(-180).max(180, { message: "Longitude must be between -180 and 180" }),
  cover_image_url: z.array(z.string().url({ message: "Invalid URL format" })),
  is_public: z.boolean(),
  onsite_payement: z.boolean().default(false),
  hashtags_list: z.array(z.string()),
});

// Schema for event creation response
export const EventSchema = z.object({
  id: z.number(),
  organizer: OrganizerSchema,
  category: z.array(z.number()),
  title: z.string(),
  description: z.string(),
  start_time: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
  end_time: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
  start_date: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
  end_date: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
  location: z.string(),
  latitude: z.number().min(-90).max(90, { message: "Latitude must be between -90 and 90" }),
  longitude: z.number().min(-180).max(180, { message: "Longitude must be between -180 and 180" }),
  cover_image_url: z.array(z.string().url({ message: "Invalid URL format" })),
  is_public: z.boolean(),
  onsite_payement: z.boolean().default(false),
  hashtags: z.array(HashtagSchema).optional(),
  likes_count: z.number().int().nonnegative().default(0),
  liked: z.boolean().default(false),
  rated: z.boolean().default(false),
  average_rating: z.number().min(0).max(5).default(0),
  rating_count: z.number().int().nonnegative().default(0),
  bookmarks_count: z.number().int().nonnegative().default(0),
  rating: RatingSchema.nullable().optional(),
  attendee_count: z.number().int().nonnegative().default(0),
  has_attended: z.boolean().default(false),
  has_ticket: z.boolean().default(false),
  bookmarked: z.boolean().default(false),
  total_revenue: z.number(),
  created_at: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
  updated_at: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
});

// Schema for paginated response
export const PaginatedEventResponseSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(EventSchema),
});

// Infer types from schemas
export type ProfileType = z.infer<typeof ProfileSchema>;
export type UserType = z.infer<typeof UserSchema>;
export type OrganizerType = z.infer<typeof OrganizerSchema>;
export type RatingType = z.infer<typeof RatingSchema>;
export type HashtagType = z.infer<typeof HashtagSchema>;
export type EventCreationType = z.infer<typeof EventCreationSchema>;
export type EventType = z.infer<typeof EventSchema>;
export type PaginatedEventResponseType = z.infer<typeof PaginatedEventResponseSchema>;