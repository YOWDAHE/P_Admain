import { z } from "zod";
import { EventSchema } from "./Event";

export const GroupSchema = z.object({
    id: z.number(),
    name: z.string(),
    event: EventSchema,
    description: z.string().optional().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
    organization: z.number().optional(),
    members_count: z.number().optional(),
});

export type GroupType = z.infer<typeof GroupSchema>;

export const GroupsResponseSchema = z.object({
    count: z.number(),
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(GroupSchema),
});

export type GroupsResponseType = z.infer<typeof GroupsResponseSchema>; 