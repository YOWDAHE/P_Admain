import { z } from "zod";

export const QRCodeDataSchema = z.object({
  eventId: z.number(),
  eventName: z.string(),
  organizerName: z.string(),
  organizerProfile: z.string().url(),
  scannedAt: z.string().datetime().optional(),
});

export type QRCodeData = z.infer<typeof QRCodeDataSchema>; 