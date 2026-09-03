import { z } from "zod";

export const propertyCategories = [
  "RESIDENTIAL_PLOT",
  "COMMERCIAL_PLOT",
  "HOUSE",
  "APARTMENT",
  "FARMHOUSE",
  "SHOP",
  "OFFICE",
  "COMMERCIAL_BUILDING",
  "OTHER",
] as const;

export const propertyStatuses = [
  "AVAILABLE",
  "FOR_SALE",
  "FOR_RENT",
  "SOLD",
  "BOOKING_OPEN",
  "COMING_SOON",
] as const;

export const areaUnits = ["MARLA", "KANAL", "SQFT", "SQYD", "ACRE"] as const;

export const propertySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255),
  slug: z.string().min(3).max(255).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and hyphens"),
  description: z.string().max(10000).default(""),
  category: z.enum(propertyCategories),
  status: z.enum(propertyStatuses).default("AVAILABLE"),
  price: z.coerce.number().min(0),
  isNegotiable: z.boolean().default(false),
  currency: z.string().max(8).default("PKR"),
  area: z.coerce.number().min(0),
  areaUnit: z.enum(areaUnits).default("MARLA"),
  location: z.string().max(255).default(""),
  city: z.string().max(120).default("Islamabad"),
  society: z.string().max(120).default(""),
  block: z.string().max(60).default(""),
  fullAddress: z.string().max(1000).default(""),
  latitude: z.coerce.number().nullable().optional(),
  longitude: z.coerce.number().nullable().optional(),
  bedrooms: z.coerce.number().int().min(0).default(0),
  bathrooms: z.coerce.number().int().min(0).default(0),
  parking: z.coerce.number().int().min(0).default(0),
  amenities: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  featuredImage: z.string().max(2000).default(""),
  images: z.array(z.string()).default([]),
  videoUrl: z.string().max(2000).default(""),
  isFeatured: z.boolean().default(false),
});

export type PropertyInput = z.infer<typeof propertySchema>;

export const projectTypes = ["RESIDENTIAL", "COMMERCIAL", "RENOVATION", "INTERIOR", "MIXED_USE"] as const;
export const projectStatuses = ["PLANNING", "UNDER_CONSTRUCTION", "COMPLETED"] as const;

export const projectSchema = z.object({
  name: z.string().min(3).max(255),
  slug: z.string().min(3).max(255).regex(/^[a-z0-9-]+$/),
  location: z.string().max(255).default(""),
  description: z.string().max(10000).default(""),
  projectType: z.enum(projectTypes).default("RESIDENTIAL"),
  status: z.enum(projectStatuses).default("PLANNING"),
  completionDate: z.string().optional().nullable(),
  featuredImage: z.string().max(2000).default(""),
  videoUrl: z.string().max(2000).default(""),
  isFeatured: z.boolean().default(false),
  features: z.array(z.string()).default([]),
  images: z.array(z.object({ url: z.string(), kind: z.enum(["GALLERY", "BEFORE", "AFTER"]).default("GALLERY") })).default([]),
});

export type ProjectInput = z.infer<typeof projectSchema>;

export const paymentPlanSchema = z.object({
  title: z.string().min(3).max(255),
  propertyId: z.coerce.number().int().nullable().optional(),
  totalPrice: z.coerce.number().min(0),
  bookingAmount: z.coerce.number().min(0).default(0),
  downPayment: z.coerce.number().min(0).default(0),
  numberOfInstallments: z.coerce.number().int().min(0).default(0),
  notes: z.string().max(2000).default(""),
  isActive: z.boolean().default(true),
});

export type PaymentPlanInput = z.infer<typeof paymentPlanSchema>;

export const inquiryTypes = ["PROPERTY", "CONSTRUCTION", "PAYMENT_PLAN", "PROPERTY_VISIT", "GENERAL"] as const;
export const inquiryStatuses = ["NEW", "CONTACTED", "INTERESTED", "CLOSED"] as const;

export const inquirySchema = z.object({
  name: z.string().min(2, "Please enter your name").max(191),
  phone: z
    .string()
    .min(7, "Please enter a valid phone number")
    .max(40)
    .regex(/^[0-9+\-\s()]+$/, "Please enter a valid phone number"),
  email: z.string().email().max(191).optional().or(z.literal("")),
  inquiryType: z.enum(inquiryTypes).default("GENERAL"),
  propertyId: z.coerce.number().int().optional().nullable(),
  projectId: z.coerce.number().int().optional().nullable(),
  message: z.string().max(3000).default(""),
  source: z.string().max(60).default("WEBSITE"),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

export const visitStatuses = ["NEW", "CONFIRMED", "COMPLETED", "CANCELLED"] as const;

export const visitSchema = z.object({
  name: z.string().min(2, "Please enter your name").max(191),
  phone: z
    .string()
    .min(7, "Please enter a valid phone number")
    .max(40)
    .regex(/^[0-9+\-\s()]+$/, "Please enter a valid phone number"),
  email: z.string().email().max(191).optional().or(z.literal("")),
  propertyId: z.coerce.number().int().optional().nullable(),
  preferredDate: z.string().min(1, "Please select a preferred date"),
  preferredTime: z.string().max(40).default(""),
  message: z.string().max(2000).default(""),
});

export type VisitInput = z.infer<typeof visitSchema>;

export const knowledgeCategories = ["COMPANY", "PROPERTIES", "CONSTRUCTION", "PAYMENT", "FAQ", "POLICIES"] as const;

export const knowledgeSchema = z.object({
  category: z.enum(knowledgeCategories).default("FAQ"),
  question: z.string().min(3).max(500),
  answer: z.string().min(3).max(5000),
  keywords: z.string().max(1000).default(""),
  isActive: z.boolean().default(true),
});

export type KnowledgeInput = z.infer<typeof knowledgeSchema>;

export const chatMessageSchema = z.object({
  message: z.string().min(1).max(1000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) }))
    .max(10)
    .default([]),
});

export const userRoles = ["SUPER_ADMIN", "ADMIN", "EDITOR"] as const;

export const userSchema = z.object({
  name: z.string().min(2).max(191),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters").max(100).optional(),
  role: z.enum(userRoles).default("EDITOR"),
  isActive: z.boolean().default(true),
});

export type UserInput = z.infer<typeof userSchema>;
