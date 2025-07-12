// FILE: server/routes.ts (Call email notification from /api/contact)
// Replace ENTIRE file content

import type { Express } from "express";
import type { Server } from "http";
// Import storage and the new type
import { storage, UserProfileUpdateData } from "./storage.js";
// Adjust path to auth if needed, ensure .js extension if your build requires it
import { setupAuth, hashPassword } from "./auth.js";
// Import shared schema types and objects
import {
  insertOrderSchema,
  insertContactMessageSchema,
  insertUserSchema,
  User as SelectUser, // Alias to avoid conflict with Express.User
  ContactInfo,
  PasswordResetToken, // Type for token objects
  Vehicle, // Needed for order confirmation email data type
  Part, // Needed for order confirmation email data type
  Order as SelectOrder, // Needed for order confirmation email data type
  InsertContactMessage, // <-- Ensure this type is imported
} from "@shared/schema"; // Adjust path if needed
import { z } from "zod";
// Import email service (only needs sending methods now)
import { emailService } from "./services/email.js"; // Adjust path if needed
// Import token utility functions from the NEW location
import {
  generatePasswordResetToken,
  verifyPasswordResetToken,
  consumePasswordResetToken,
} from "./utils/token-utils.js"; // <-- Import from new utils file, adjust path
import passport from "passport"; // For req.login, req.isAuthenticated, req.user

// Define a Zod schema for the expected guest order input payload from the frontend
const guestOrderPayloadSchema = z
  .object({
    vehicle: z
      .custom<Vehicle>((val) => typeof val === "object" && val !== null, {
        message: "Неверный формат данных автомобиля",
      })
      .optional(),
    parts: z
      .array(
        z.custom<Part>((val) => typeof val === "object" && val !== null, {
          message: "Неверный формат данных запчасти",
        }),
      )
      .min(1, "Список запчастей не может быть пустым"),
    contactInfo: z.object({
      name: z.string().min(1, "Имя обязательно"),
      email: z
        .string()
        .email("Неверный формат email")
        .optional()
        .or(z.literal("")),
      phone: z.string().min(1, "Телефон обязателен"), // Consider more specific validation
      countryCode: z.string().min(1, "Код страны обязателен"),
      city: z.string().optional().or(z.literal("")),
      comments: z.string().optional(),
    }),
    createAccount: z.boolean().optional().default(false),
    password: z.string().optional(),
  })
  .refine(
    (data) => {
      if (
        data.createAccount &&
        (!data.contactInfo.email || data.contactInfo.email.trim() === "")
      )
        return false;
      if (data.createAccount && (!data.password || data.password.length < 6))
        return false;
      return true;
    },
    {
      message:
        "Email и пароль (минимум 6 символов) обязательны при создании аккаунта",
    },
  );

// Define a Zod schema for the profile update payload
const updateProfilePayloadSchema = z.object({
  fullName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  countryCode: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
});

// --- Main Route Registration Function ---
export async function registerRoutes(app: Express, server: Server) {
  // Setup auth routes (login, logout, register, /api/user) provided by auth.ts
  setupAuth(app);

  // --- Order API for LOGGED-IN users ---
  app.post("/api/orders", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Необходима авторизация" });
      }
      const contactInfoForOrder: ContactInfo = {
        name: req.body.contactInfo?.name || req.user.fullName || "N/A",
        email: req.body.contactInfo?.email || req.user.email || "N/A",
        phone: req.body.contactInfo?.phone || req.user.phone || "N/A",
        countryCode:
          req.body.contactInfo?.countryCode || req.user.countryCode || "N/A",
        city: req.body.contactInfo?.city || req.user.city || "",
        comments: req.body.contactInfo?.comments || "",
      };
      const validatedData = insertOrderSchema.safeParse({
        vehicle: req.body.vehicle,
        parts: req.body.parts,
        contactInfo: contactInfoForOrder,
        userId: req.user.id, // Associate order with logged-in user
        status: "new", // Default status
      });

      if (!validatedData.success) {
        console.error(
          "[/api/orders] Zod Validation Error:",
          validatedData.error.flatten(),
        );
        return res.status(400).json({
          message: "Ошибка валидации данных заказа (залогинен)",
          errors: validatedData.error.flatten(),
        });
      }
      const order: SelectOrder = await storage.createOrder(validatedData.data);
      emailService
        .sendOrderConfirmation(
          order,
          validatedData.data.vehicle, // Pass validated data to email service
          validatedData.data.parts,
          validatedData.data.contactInfo,
        )
        .catch((emailError) => {
          console.error(
            `[/api/orders] Failed to send order confirmation email for order ${order.id}:`,
            emailError,
          );
        });
      res.status(201).json(order); // Respond with created order
    } catch (error) {
      console.error(
        "[/api/orders] Error creating order for logged-in user:",
        error,
      );
      next(error); // Pass other errors to generic handler
    }
  });

  // --- Order API for GUESTS (Handles optional account creation) ---
  app.post("/api/guest-order", async (req, res, next) => {
    let newUser: SelectUser | null = null;
    let newUserId: number | null = null; // Initialize as null for clarity

    try {
      const parsedPayload = guestOrderPayloadSchema.safeParse(req.body);
      if (!parsedPayload.success) {
        console.error(
          "[/api/guest-order] Zod Payload Validation Error:",
          parsedPayload.error.flatten(),
        );
        return res.status(400).json({
          message: "Ошибка валидации данных гостевого заказа",
          errors: parsedPayload.error.flatten(),
        });
      }

      const { vehicle, parts, contactInfo, createAccount, password } =
        parsedPayload.data;
      const email = contactInfo.email ? contactInfo.email.trim() : null;

      if (createAccount && email && password) {
        console.log(
          `[/api/guest-order] Attempting account creation for email: ${email}`,
        );
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser) {
          console.warn(
            `[/api/guest-order] Account creation failed: Email ${email} already exists.`,
          );
          return res.status(409).json({
            message:
              "Пользователь с таким email уже существует. Пожалуйста, войдите или оформите заказ без создания аккаунта.",
            field: "email",
          });
        }
        const hashedPassword = await hashPassword(password);
        const newUserData = {
          email: email,
          password: hashedPassword,
          fullName: contactInfo.name || null,
          phone: contactInfo.phone || null,
          countryCode: contactInfo.countryCode || null,
          city: contactInfo.city || null,
        };
        newUser = await storage.createUser(newUserData);
        newUserId = newUser.id;
        console.log(
          `[/api/guest-order] Created new user (ID: ${newUserId}) during guest checkout.`,
        );
      } else {
        console.log(
          "[/api/guest-order] Processing guest order without account creation.",
        );
      }

      const finalOrderData = insertOrderSchema.safeParse({
        userId: newUserId,
        vehicle: vehicle,
        parts: parts,
        contactInfo: {
          name: contactInfo.name,
          email: contactInfo.email,
          phone: contactInfo.phone,
          countryCode: contactInfo.countryCode,
          city: contactInfo.city,
          comments: contactInfo.comments,
        },
        status: "new",
      });

      if (!finalOrderData.success) {
        console.error(
          "[/api/guest-order] Zod Final Order Data Validation Error:",
          finalOrderData.error.flatten(),
        );
        return res.status(400).json({
          message: "Ошибка при подготовке данных заказа для сохранения",
          errors: finalOrderData.error.flatten(),
        });
      }

      const order: SelectOrder = await storage.createOrder(finalOrderData.data);
      console.log(
        `[/api/guest-order] Created order (ID: ${order.id}) with userId: ${newUserId === null ? "NULL" : newUserId}`,
      );

      emailService
        .sendOrderConfirmation(
          order,
          finalOrderData.data.vehicle as Vehicle,
          finalOrderData.data.parts as Part[],
          finalOrderData.data.contactInfo,
        )
        .catch((emailError) => {
          console.error(
            `[/api/guest-order] Failed to send order confirmation email for order ${order.id}:`,
            emailError,
          );
        });

      if (newUser) {
        const userToLogin: SelectUser = {
          id: newUser.id,
          email: newUser.email,
          password: newUser.password,
          fullName: newUser.fullName,
          phone: newUser.phone,
          countryCode: newUser.countryCode,
          city: newUser.city,
          createdAt: newUser.createdAt,
        };
        req.login(userToLogin, (err) => {
          if (err) {
            console.error(
              "[/api/guest-order] Auto-login failed after guest registration:",
              err,
            );
            const { password: removedPassword, ...userWithoutPassword } =
              userToLogin;
            return res.status(201).json({
              user: userWithoutPassword,
              order: order,
              message:
                "Заказ размещен и аккаунт создан, но автоматический вход не удался.",
            });
          }
          const { password: removedPassword, ...userWithoutPassword } =
            userToLogin;
          console.log(
            `[/api/guest-order] Auto-logged in user (ID: ${userToLogin.id}) after guest registration.`,
          );
          return res.status(201).json({
            user: userWithoutPassword,
            order: order,
            message: "Заказ размещен и аккаунт успешно создан.",
          });
        });
      } else {
        res.status(201).json({
          order: order,
          message: "Order placed successfully as guest.",
        });
      }
    } catch (error) {
      console.error("[/api/guest-order] Error processing guest order:", error);
      next(error);
    }
  });

  // --- Get User Orders (Protected) ---
  app.get("/api/orders", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Необходима авторизация" });
      }
      const orders = await storage.getOrdersByUserId(req.user.id);
      res.json(orders);
    } catch (error) {
      console.error("[/api/orders] Error fetching user orders:", error);
      next(error);
    }
  });

  // --- Get Specific Order (Protected) ---
  app.get("/api/orders/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Необходима авторизация" });
      }
      const orderId = parseInt(req.params.id, 10);
      if (isNaN(orderId)) {
        return res.status(400).json({ message: "Неверный ID заказа" });
      }
      const order = await storage.getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Заказ не найден" });
      }
      if (order.userId !== req.user.id) {
        console.warn(
          `[/api/orders/:id] User ${req.user.id} attempted to access order ${orderId} owned by ${order.userId}`,
        );
        return res
          .status(403)
          .json({ message: "У вас нет доступа к этому заказу" });
      }
      res.json(order);
    } catch (error) {
      console.error(
        `[/api/orders/:id] Error fetching order ${req.params.id}:`,
        error,
      );
      next(error);
    }
  });

  // --- Update User Profile (Protected) ---
  app.patch("/api/user/profile", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Необходима авторизация" });
      }
      const validatedData = updateProfilePayloadSchema.safeParse(req.body);
      if (!validatedData.success) {
        console.error(
          "[/api/user/profile] Zod Validation Error:",
          validatedData.error.flatten(),
        );
        return res.status(400).json({
          message: "Ошибка валидации данных профиля",
          errors: validatedData.error.flatten(),
        });
      }
      const updatedUser = await storage.updateUserProfile(
        req.user.id,
        validatedData.data as UserProfileUpdateData,
      );
      const { password: removedPassword, ...userWithoutPassword } = updatedUser;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("[/api/user/profile] Error updating user profile:", error);
      next(error);
    }
  });

  // --- Contact Form API ---
  app.post("/api/contact", async (req, res, next) => {
    try {
      // 1. Validate the incoming data
      const validatedData = insertContactMessageSchema.parse(req.body);

      // 2. Save the message to the database (as before)
      await storage.createContactMessage(validatedData);

      // 3. --- NEW: Send email notification to admin (fire-and-forget) ---
      emailService
        .sendContactFormNotification(validatedData) // Pass validated data
        .then(({ success, error }) => {
          if (!success) {
            console.error(
              "[/api/contact] Failed to send contact form notification email:",
              error,
            );
          } else {
            console.log(
              "[/api/contact] Contact form notification email sent successfully.",
            );
          }
        })
        .catch((emailError) => {
          // Catch unexpected errors in the promise chain itself
          console.error(
            "[/api/contact] Unexpected error calling sendContactFormNotification:",
            emailError,
          );
        });
      // --- END NEW ---

      // 4. Respond to the user immediately after saving (don't wait for email)
      res.status(201).json({ message: "Сообщение успешно отправлено" });
    } catch (error) {
      console.error("[/api/contact] Error processing contact form:", error);
      if (error instanceof z.ZodError) {
        // Handle validation errors specifically
        return res.status(400).json({
          message: "Ошибка валидации данных",
          errors: error.flatten(),
        });
      }
      // Pass other errors to the generic handler
      next(error);
    }
  });

  // --- Password Reset Flow ---
  app.post("/api/forgot-password", async (req, res, next) => {
    try {
      const { email } = req.body;
      if (!email || typeof email !== "string") {
        return res
          .status(400)
          .json({ message: "Email обязателен и должен быть строкой" });
      }
      const sanitizedEmail = email.trim();
      if (!sanitizedEmail) {
        return res.status(400).json({ message: "Email не может быть пустым" });
      }
      console.log(
        `[/api/forgot-password] Received request for email: ${sanitizedEmail}`,
      );

      const user = await storage.getUserByEmail(sanitizedEmail);
      if (!user) {
        console.log(
          `[/api/forgot-password] User not found for email: ${sanitizedEmail}. Returning masked success.`,
        );
        return res.status(200).json({
          message:
            "Если аккаунт с указанным email существует, на него будут отправлены инструкции по сбросу пароля.",
        });
      }
      console.log(`[/api/forgot-password] Found user ID: ${user.id}`);

      let resetTokenObject: PasswordResetToken | null = null;
      try {
        console.log(
          `[/api/forgot-password] Generating token for user ID: ${user.id}`,
        );
        resetTokenObject = await generatePasswordResetToken(user.id);
        console.log(
          `[/api/forgot-password] Received from generatePasswordResetToken:`,
          resetTokenObject,
        );

        if (
          !resetTokenObject ||
          typeof resetTokenObject !== "object" ||
          !resetTokenObject.token
        ) {
          console.error(
            `[/api/forgot-password] Failed to get valid token object back! Received:`,
            resetTokenObject,
          );
          throw new Error("Failed to generate password reset token object.");
        }
        console.log(
          `[/api/forgot-password] Token generated successfully: ${resetTokenObject.token.substring(0, 5)}...`,
        );
      } catch (tokenGenError) {
        console.error(
          `[/api/forgot-password] Error during token generation call:`,
          tokenGenError,
        );
        return res.status(200).json({
          message:
            "Если аккаунт с указанным email существует, на него будут отправлены инструкции по сбросу пароля.",
        });
      }

      if (resetTokenObject) {
        try {
          console.log(
            `[/api/forgot-password] Attempting to send email with token object ID: ${resetTokenObject.id}`,
          );
          await emailService.sendPasswordResetEmail(
            sanitizedEmail,
            resetTokenObject,
          );
          console.log(
            `[/api/forgot-password] Email service call completed for ${sanitizedEmail}.`,
          );
        } catch (emailError) {
          console.error(
            `[/api/forgot-password] Error occurred during emailService.sendPasswordResetEmail call:`,
            emailError,
          );
          return res.status(200).json({
            message:
              "Если аккаунт с указанным email существует, на него будут отправлены инструкции по сбросу пароля.",
          });
        }
      }
      res.status(200).json({
        message:
          "Если аккаунт с указанным email существует, на него будут отправлены инструкции по сбросу пароля.",
      });
    } catch (error) {
      console.error(
        "[/api/forgot-password] Unhandled error in route handler:",
        error,
      );
      next(error);
    }
  });

  app.post("/api/verify-reset-token", async (req, res, next) => {
    try {
      const { token } = req.body;
      if (!token || typeof token !== "string") {
        return res
          .status(400)
          .json({ message: "Токен отсутствует или неверный формат" });
      }
      const resetToken = await verifyPasswordResetToken(token);
      if (!resetToken) {
        return res
          .status(400)
          .json({ message: "Недействительный или просроченный токен" });
      }
      res.status(200).json({ valid: true });
    } catch (error) {
      console.error(
        "[/api/verify-reset-token] Error verifying reset token:",
        error,
      );
      res.status(500).json({ message: "Ошибка при проверке токена." });
    }
  });

  app.post("/api/reset-password", async (req, res, next) => {
    try {
      const { token, password } = req.body;
      if (
        !token ||
        typeof token !== "string" ||
        !password ||
        typeof password !== "string" ||
        password.length < 6
      ) {
        return res.status(400).json({
          message: "Токен и новый пароль (минимум 6 символов) обязательны",
        });
      }

      const resetToken = await verifyPasswordResetToken(token);
      if (!resetToken) {
        return res
          .status(400)
          .json({ message: "Недействительный или просроченный токен" });
      }

      const user = await storage.getUser(resetToken.userId);
      if (!user) {
        console.error(
          `[/api/reset-password] User not found (ID: ${resetToken.userId}) for valid reset token.`,
        );
        return res
          .status(404)
          .json({ message: "Связанный пользователь не найден" });
      }

      const hashedPassword = await hashPassword(password);
      await storage.updateUserPassword(user.id, hashedPassword);
      await consumePasswordResetToken(token);

      console.log(
        `[/api/reset-password] Password successfully reset for user ID: ${user.id}`,
      );
      res.status(200).json({ message: "Пароль успешно изменен" });
    } catch (error) {
      console.error("[/api/reset-password] Error resetting password:", error);
      res.status(500).json({ message: "Ошибка при сбросе пароля." });
    }
  });
} // End of registerRoutes function
