import { z } from "zod";

export const registerSchema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  referralCode: z.string().trim().optional().or(z.literal(""))
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export const orderSchema = z.object({
  customerName: z.string().min(2),
  phone: z.string().min(7),
  area: z.string().min(2),
  productName: z.string().min(2),
  amount: z.coerce.number().min(0),
  stage: z.enum(["new_order", "waiting_payment", "paid", "packing", "dispatched", "delivered", "follow_up"]),
  paymentStatus: z.enum(["unpaid", "partial", "paid", "cod"]),
  notes: z.string().optional().default("")
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
