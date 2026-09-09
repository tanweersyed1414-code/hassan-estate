import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  numeric,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ---------- ENUMS ----------
export const roleEnum = pgEnum("role", ["SUPER_ADMIN", "ADMIN", "EDITOR"]);

export const propertyCategoryEnum = pgEnum("property_category", [
  "RESIDENTIAL_PLOT",
  "COMMERCIAL_PLOT",
  "HOUSE",
  "APARTMENT",
  "FARMHOUSE",
  "SHOP",
  "OFFICE",
  "COMMERCIAL_BUILDING",
  "OTHER",
]);

export const propertyStatusEnum = pgEnum("property_status", [
  "AVAILABLE",
  "FOR_SALE",
  "FOR_RENT",
  "SOLD",
  "BOOKING_OPEN",
  "COMING_SOON",
]);

export const areaUnitEnum = pgEnum("area_unit", [
  "MARLA",
  "KANAL",
  "SQFT",
  "SQYD",
  "ACRE",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "PLANNING",
  "UNDER_CONSTRUCTION",
  "COMPLETED",
]);

export const projectTypeEnum = pgEnum("project_type", [
  "RESIDENTIAL",
  "COMMERCIAL",
  "RENOVATION",
  "INTERIOR",
  "MIXED_USE",
]);

export const inquiryTypeEnum = pgEnum("inquiry_type", [
  "PROPERTY",
  "CONSTRUCTION",
  "PAYMENT_PLAN",
  "PROPERTY_VISIT",
  "GENERAL",
]);

export const inquiryStatusEnum = pgEnum("inquiry_status", [
  "NEW",
  "CONTACTED",
  "INTERESTED",
  "CLOSED",
]);

export const visitStatusEnum = pgEnum("visit_status", [
  "NEW",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
]);

export const knowledgeCategoryEnum = pgEnum("knowledge_category", [
  "COMPANY",
  "PROPERTIES",
  "CONSTRUCTION",
  "PAYMENT",
  "FAQ",
  "POLICIES",
]);

export const mediaTypeEnum = pgEnum("media_type", ["IMAGE", "VIDEO", "DOCUMENT"]);

// ---------- USERS & ROLES ----------
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 191 }).notNull(),
  email: varchar("email", { length: 191 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("EDITOR"),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------- PROPERTIES ----------
export const properties = pgTable(
  "properties",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description").notNull().default(""),
    category: propertyCategoryEnum("category").notNull(),
    status: propertyStatusEnum("status").notNull().default("AVAILABLE"),
    price: numeric("price", { precision: 14, scale: 2 }).notNull().default("0"),
    isNegotiable: boolean("is_negotiable").notNull().default(false),
    currency: varchar("currency", { length: 8 }).notNull().default("PKR"),
    area: numeric("area", { precision: 12, scale: 2 }).notNull().default("0"),
    areaUnit: areaUnitEnum("area_unit").notNull().default("MARLA"),
    location: varchar("location", { length: 255 }).notNull().default(""),
    city: varchar("city", { length: 120 }).notNull().default("Islamabad"),
    society: varchar("society", { length: 120 }).notNull().default(""),
    block: varchar("block", { length: 60 }).notNull().default(""),
    fullAddress: text("full_address").notNull().default(""),
    latitude: numeric("latitude", { precision: 10, scale: 6 }),
    longitude: numeric("longitude", { precision: 10, scale: 6 }),
    bedrooms: integer("bedrooms").notNull().default(0),
    bathrooms: integer("bathrooms").notNull().default(0),
    parking: integer("parking").notNull().default(0),
    amenities: text("amenities").notNull().default("[]"), // JSON string array
    featuredImage: text("featured_image").notNull().default(""),
    videoUrl: text("video_url").notNull().default(""),
    isFeatured: boolean("is_featured").notNull().default(false),
    viewCount: integer("view_count").notNull().default(0),
    createdById: integer("created_by_id").references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    citySlugIdx: index("properties_city_idx").on(t.city),
    categoryIdx: index("properties_category_idx").on(t.category),
    statusIdx: index("properties_status_idx").on(t.status),
    priceIdx: index("properties_price_idx").on(t.price),
  })
);

export const propertyImages = pgTable("property_images", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  alt: varchar("alt", { length: 255 }).notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const propertyFeatures = pgTable("property_features", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 120 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

// ---------- PAYMENT PLANS ----------
export const paymentPlans = pgTable("payment_plans", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  propertyId: integer("property_id").references(() => properties.id, {
    onDelete: "set null",
  }),
  projectId: integer("project_id"),
  totalPrice: numeric("total_price", { precision: 14, scale: 2 }).notNull().default("0"),
  bookingAmount: numeric("booking_amount", { precision: 14, scale: 2 }).notNull().default("0"),
  downPayment: numeric("down_payment", { precision: 14, scale: 2 }).notNull().default("0"),
  remainingAmount: numeric("remaining_amount", { precision: 14, scale: 2 }).notNull().default("0"),
  monthlyInstallment: numeric("monthly_installment", { precision: 14, scale: 2 }).notNull().default("0"),
  quarterlyInstallment: numeric("quarterly_installment", { precision: 14, scale: 2 }).notNull().default("0"),
  numberOfInstallments: integer("number_of_installments").notNull().default(0),
  notes: text("notes").notNull().default(""),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const paymentInstallments = pgTable("payment_installments", {
  id: serial("id").primaryKey(),
  paymentPlanId: integer("payment_plan_id")
    .notNull()
    .references(() => paymentPlans.id, { onDelete: "cascade" }),
  installmentNumber: integer("installment_number").notNull(),
  label: varchar("label", { length: 120 }).notNull().default(""),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull().default("0"),
  dueDate: timestamp("due_date"),
});

// ---------- CONSTRUCTION PROJECTS ----------
export const constructionProjects = pgTable("construction_projects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  location: varchar("location", { length: 255 }).notNull().default(""),
  description: text("description").notNull().default(""),
  projectType: projectTypeEnum("project_type").notNull().default("RESIDENTIAL"),
  status: projectStatusEnum("status").notNull().default("PLANNING"),
  completionDate: timestamp("completion_date"),
  featuredImage: text("featured_image").notNull().default(""),
  videoUrl: text("video_url").notNull().default(""),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const projectImages = pgTable("project_images", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => constructionProjects.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  alt: varchar("alt", { length: 255 }).notNull().default(""),
  kind: varchar("kind", { length: 20 }).notNull().default("GALLERY"), // GALLERY | BEFORE | AFTER
  sortOrder: integer("sort_order").notNull().default(0),
});

export const projectFeatures = pgTable("project_features", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => constructionProjects.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 120 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

// ---------- INQUIRIES ----------
export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 191 }).notNull(),
  phone: varchar("phone", { length: 40 }).notNull(),
  email: varchar("email", { length: 191 }).notNull().default(""),
  inquiryType: inquiryTypeEnum("inquiry_type").notNull().default("GENERAL"),
  propertyId: integer("property_id").references(() => properties.id, { onDelete: "set null" }),
  projectId: integer("project_id").references(() => constructionProjects.id, { onDelete: "set null" }),
  message: text("message").notNull().default(""),
  source: varchar("source", { length: 60 }).notNull().default("WEBSITE"),
  status: inquiryStatusEnum("status").notNull().default("NEW"),
  internalNotes: text("internal_notes").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------- VISITORS (public users who sign in with Google to book visits) ----------
export const visitors = pgTable("visitors", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 191 }).notNull().unique(),
  name: varchar("name", { length: 191 }).notNull().default(""),
  image: text("image").notNull().default(""),
  googleSub: varchar("google_sub", { length: 255 }).notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
});

// ---------- PROPERTY VISITS ----------
export const propertyVisits = pgTable("property_visits", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 191 }).notNull(),
  phone: varchar("phone", { length: 40 }).notNull(),
  email: varchar("email", { length: 191 }).notNull().default(""),
  visitorId: integer("visitor_id").references(() => visitors.id, { onDelete: "set null" }),
  propertyId: integer("property_id").references(() => properties.id, { onDelete: "set null" }),
  preferredDate: timestamp("preferred_date"),
  preferredTime: varchar("preferred_time", { length: 40 }).notNull().default(""),
  message: text("message").notNull().default(""),
  status: visitStatusEnum("status").notNull().default("NEW"),
  adminNote: text("admin_note").notNull().default(""),
  decidedAt: timestamp("decided_at"),
  notifiedAt: timestamp("notified_at"),
  /** When the visitor last opened /my-visits after a decision — drives the unread dot. */
  visitorSeenAt: timestamp("visitor_seen_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------- AI KNOWLEDGE BASE ----------
export const aiKnowledgeBase = pgTable("ai_knowledge_base", {
  id: serial("id").primaryKey(),
  category: knowledgeCategoryEnum("category").notNull().default("FAQ"),
  question: varchar("question", { length: 500 }).notNull(),
  answer: text("answer").notNull(),
  keywords: text("keywords").notNull().default(""), // comma separated
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------- SITE SETTINGS ----------
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 120 }).notNull().unique(),
  value: text("value").notNull().default(""),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------- MEDIA FILES ----------
export const mediaFiles = pgTable("media_files", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  type: mediaTypeEnum("type").notNull().default("IMAGE"),
  fileName: varchar("file_name", { length: 255 }).notNull().default(""),
  fileSize: integer("file_size").notNull().default(0),
  uploadedById: integer("uploaded_by_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------- RELATIONS ----------
export const propertiesRelations = relations(properties, ({ many }) => ({
  images: many(propertyImages),
  features: many(propertyFeatures),
  paymentPlans: many(paymentPlans),
}));

export const propertyImagesRelations = relations(propertyImages, ({ one }) => ({
  property: one(properties, { fields: [propertyImages.propertyId], references: [properties.id] }),
}));

export const propertyFeaturesRelations = relations(propertyFeatures, ({ one }) => ({
  property: one(properties, { fields: [propertyFeatures.propertyId], references: [properties.id] }),
}));

export const constructionProjectsRelations = relations(constructionProjects, ({ many }) => ({
  images: many(projectImages),
  features: many(projectFeatures),
}));

export const projectImagesRelations = relations(projectImages, ({ one }) => ({
  project: one(constructionProjects, { fields: [projectImages.projectId], references: [constructionProjects.id] }),
}));

export const projectFeaturesRelations = relations(projectFeatures, ({ one }) => ({
  project: one(constructionProjects, { fields: [projectFeatures.projectId], references: [constructionProjects.id] }),
}));

export const paymentPlansRelations = relations(paymentPlans, ({ one, many }) => ({
  property: one(properties, { fields: [paymentPlans.propertyId], references: [properties.id] }),
  installments: many(paymentInstallments),
}));

export const paymentInstallmentsRelations = relations(paymentInstallments, ({ one }) => ({
  plan: one(paymentPlans, { fields: [paymentInstallments.paymentPlanId], references: [paymentPlans.id] }),
}));

export type User = typeof users.$inferSelect;
export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;
export type PropertyImage = typeof propertyImages.$inferSelect;
export type PropertyFeature = typeof propertyFeatures.$inferSelect;
export type PaymentPlan = typeof paymentPlans.$inferSelect;
export type PaymentInstallment = typeof paymentInstallments.$inferSelect;
export type ConstructionProject = typeof constructionProjects.$inferSelect;
export type NewConstructionProject = typeof constructionProjects.$inferInsert;
export type ProjectImage = typeof projectImages.$inferSelect;
export type ProjectFeature = typeof projectFeatures.$inferSelect;
export type Inquiry = typeof inquiries.$inferSelect;
export type PropertyVisit = typeof propertyVisits.$inferSelect;
export type Visitor = typeof visitors.$inferSelect;
export type AIKnowledgeEntry = typeof aiKnowledgeBase.$inferSelect;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type MediaFile = typeof mediaFiles.$inferSelect;
