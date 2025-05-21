import { z } from 'zod';

export const CategoryCreationSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
});

export const CategoryCreationResponseSchema = CategoryCreationSchema.extend({
    id: z.number(),
    organizer: z.number(),
    name: z.string(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
});

export const PaginatedCategorySchema = z.object({
    count: z.number(),
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(CategoryCreationResponseSchema),
});

export type newCategioryType = z.infer<typeof CategoryCreationSchema>;
export type CategoryCreationResponseType = z.infer<typeof CategoryCreationResponseSchema>;
export type PaginatedCategoryType = z.infer<typeof PaginatedCategorySchema>;