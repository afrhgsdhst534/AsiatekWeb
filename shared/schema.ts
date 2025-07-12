// FILE: shared/schema.ts (Corrected Export)
// Replace ENTIRE file content

import {
  pgTable,
  text,
  serial,
  integer,
  timestamp,
  json,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model (Schema remains the same, email handled by insert schema)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique(), // Email IS unique if provided
  password: text("password").notNull(), // Password required IF creating user
  fullName: text("full_name"),
  phone: text("phone"),
  countryCode: text("country_code"),
  city: text("city"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Insert Schema (Make fields truly optional where applicable for guest possibility)
export const insertUserSchema = createInsertSchema(users)
  .pick({
    email: true, // Keep email required for account creation itself
    password: true,
    fullName: true,
    phone: true,
    countryCode: true,
    city: true,
  })
  .extend({
    email: z.string().email("Неверный формат email"), // Email required if creating account
    password: z.string().min(6, "Пароль должен содержать минимум 6 символов"), // Required only if creating account (handled by refine elsewhere)
    fullName: z.string().min(1, "Имя обязательно").optional(), // Optional here, required by contactInfo
    phone: z.string().min(1, "Телефон обязателен").optional(), // Optional here, required by contactInfo
    countryCode: z.string().min(1, "Код страны обязатеlen").optional(), // Optional here, required by contactInfo
    city: z.string().optional(),
  });

// Vehicle model (No changes needed, ensure it's exported)
export const vehicleSchema = z.object({
  // Added export
  type: z.enum(["passenger", "commercial", "chinese"]),
  vin: z.string().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  year: z
    .number()
    .int()
    .min(1900)
    .max(new Date().getFullYear() + 1)
    .optional()
    .nullable(), // Allow null if not provided
  engineVolume: z.string().optional(),
  fuelType: z.string().optional(),
});

// Part model (<<< ADDED EXPORT HERE >>>)
export const partSchema = z.object({
  // Added export
  name: z.string().min(1, "Название запчасти обязательно"),
  quantity: z.number().int().min(1, "Минимальное количество 1"),
  sku: z.string().optional(),
  brand: z.string().optional(),
  description: z.string().optional(),
});

// Contact info model (ADD createAccount, make password fields optional here)
// This schema represents the data collected in StepFour specifically
export const stepFourContactSchema = z
  .object({
    name: z.string().min(1, "Имя обязательно"),
    // Email is technically optional for guests BUT required if creating account
    email: z
      .string()
      .email("Неверный формат email")
      .optional()
      .or(z.literal("")),
    phone: z.string().min(10, "Телефон обязателен"), // Example min length
    countryCode: z.string().min(1, "Код страны обязателен"),
    city: z.string().optional().or(z.literal("")),
    comments: z.string().optional(),

    // --- New Fields for Optional Registration ---
    createAccount: z.boolean().default(false),
    password: z.string().optional(),
    passwordConfirm: z.string().optional(),
  })
  // --- Add Refinement for Conditional Password Validation ---
  .superRefine((data, ctx) => {
    // If the checkbox IS checked, THEN validate passwords
    if (data.createAccount) {
      // Require email if creating account
      if (!data.email) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Email обязателен для создания аккаунта",
          path: ["email"],
        });
      }
      // Require password if creating account
      if (!data.password || data.password.length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Пароль должен быть не менее 6 символов",
          path: ["password"],
        });
      }
      // Require password confirmation to match
      if (data.password !== data.passwordConfirm) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Пароли не совпадают",
          path: ["passwordConfirm"],
        });
      }
    }
  });

// Order table schema (Make userId nullable)
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  // --- CHANGE: Allow userId to be NULL ---
  userId: integer("user_id").references(() => users.id, {
    onDelete: "set null",
  }), // Reference users, handle deletion rule
  // --- END CHANGE ---
  vehicle: json("vehicle").notNull(),
  parts: json("parts").notNull(),
  contactInfo: json("contact_info").notNull(),
  status: text("status")
    .$type<"new" | "processing" | "shipped" | "delivered" | "cancelled">()
    .notNull()
    .default("new"), // Added enum type hint
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Order Insert Schema (Update types, userId optional)
// This schema defines what data structure is needed to INSERT an order row
export const insertOrderSchema = createInsertSchema(orders)
  .pick({
    userId: true, // Keep it picked
    vehicle: true,
    parts: true,
    contactInfo: true,
    status: true,
  })
  .extend({
    // --- CHANGE: Make userId optional for insertion ---
    userId: z.number().int().optional().nullable(), // Allow number, undefined, or null
    // --- END CHANGE ---
    vehicle: vehicleSchema, // Use the defined vehicle schema
    parts: z.array(partSchema).min(1, "Добавьте хотя бы одну запчасть"),
    // Use a base contact info schema WITHOUT password fields for storing in the order itself
    contactInfo: z.object({
      name: z.string().min(1),
      email: z.string().email().optional().or(z.literal("")),
      phone: z.string().min(1),
      countryCode: z.string().min(1),
      city: z.string().optional().or(z.literal("")),
      comments: z.string().optional(),
    }),
    status: z
      .enum(["new", "processing", "shipped", "delivered", "cancelled"])
      .default("new"),
  });

// Contact message model (No changes needed here)
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  countryCode: text("country_code").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContactMessageSchema = createInsertSchema(contactMessages)
  .pick({
    name: true,
    email: true,
    phone: true,
    countryCode: true,
    message: true,
  })
  .extend({
    email: z
      .string()
      .email("Неверный формат email")
      .optional()
      .or(z.literal("")),
    phone: z.string().min(1, "Телефон обязателен"),
    message: z
      .string()
      .min(10, "Сообщение должно содержать минимум 10 символов"),
  });

// Password reset token model (No changes needed here)
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // Reference users
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  used: boolean("used").default(false).notNull(),
});

export const insertPasswordResetTokenSchema = createInsertSchema(
  passwordResetTokens,
).pick({ token: true, userId: true, expiresAt: true, used: true });

// --- EXPORT TYPES ---
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type SelectUser = User; // Alias for consistency

export type Vehicle = z.infer<typeof vehicleSchema>;
export type Part = z.infer<typeof partSchema>; // Type export was already correct

// Type for Step 4 form data including optional password/createAccount
export type StepFourFormData = z.infer<typeof stepFourContactSchema>;
// Type for ContactInfo stored in DB (without password fields)
export type ContactInfo = z.infer<typeof insertOrderSchema.shape.contactInfo>;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;

export type InsertPasswordResetToken = z.infer<
  typeof insertPasswordResetTokenSchema
>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
