import { z } from 'zod';


export const TicketSchema = z.object({
  event: z.number(),
  name: z.string(),
  price: z.string().regex(/^-?\d+(\.\d+)?$/, { message: "Invalid price format" }),
  valid_from: z.string().datetime({ message: "Invalid ISO 8601 date format" }),
  valid_until: z.string().datetime({ message: "Invalid ISO 8601 date format" }),
});

export const TicketResponseSchema = z.object({
  id: z.number(),
  event: z.number(),
  name: z.string(),
  onsite_payement: z.boolean(),
  price: z.string().regex(/^-?\d+(\.\d+)?$/, { message: "Invalid price format" }),
  valid_from: z.string().datetime({ message: "Invalid ISO 8601 date format" }),
  valid_until: z.string().datetime({ message: "Invalid ISO 8601 date format" }),
  created_at: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
  updated_at: z.string().datetime({ message: "Invalid ISO 8601 datetime format" }),
});


export type TicketType = z.infer<typeof TicketSchema>;
export type TicketResponseType = z.infer<typeof TicketResponseSchema>;