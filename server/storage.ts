// FILE: server/storage.ts (Add updateUserProfile function)
// Replace ENTIRE file content

import { db } from "./db"; // Assuming 'db' is your Drizzle client instance
import {
  users,
  orders,
  contactMessages,
  passwordResetTokens, // Import table schemas
  InsertUser,
  InsertOrder,
  InsertContactMessage,
  InsertPasswordResetToken, // Import insert types
  User as SelectUser,
  Order as SelectOrder,
  ContactMessage as SelectContactMessage, // Import select types
  PasswordResetToken, // Import select type for return value
} from "@shared/schema"; // Adjust path if needed
import { eq, sql, desc, gte, and } from "drizzle-orm";
import bcrypt from "bcryptjs"; // Assuming bcryptjs is used for hashing

// Define type for profile update data (subset of SelectUser)
// Matches the structure sent from the frontend
export type UserProfileUpdateData = {
  fullName?: string | null;
  phone?: string | null;
  countryCode?: string | null;
  city?: string | null;
};

// --- Define Storage Object ---
export const storage = {
  // --- User Functions ---
  async getUser(id: number): Promise<SelectUser | null> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error(`[storage] Error fetching user by ID ${id}:`, error);
      return null;
    }
  },
  async getUserByEmail(email: string): Promise<SelectUser | null> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error(`[storage] Error fetching user by email ${email}:`, error);
      return null;
    }
  },
  async createUser(
    userData: Omit<SelectUser, "id" | "createdAt">,
  ): Promise<SelectUser> {
    console.log("[storage] Attempting to create user:", {
      email: userData.email,
    }); // Don't log password hash
    try {
      const result = await db
        .insert(users)
        .values({
          email: userData.email,
          password: userData.password,
          fullName: userData.fullName,
          phone: userData.phone,
          countryCode: userData.countryCode,
          city: userData.city,
          // createdAt/updatedAt are handled by DB default
        })
        .returning(); // Return the created user

      if (!result || result.length === 0) {
        console.error("[storage] Failed to insert or return created user.");
        throw new Error("Database failed to return created user.");
      }
      console.log("[storage] User created successfully:", {
        id: result[0].id,
        email: result[0].email,
      });
      return result[0];
    } catch (error) {
      console.error("[storage] Error in createUser:", error);
      throw error; // Re-throw
    }
  },

  // --- NEW FUNCTION: Update User Profile ---
  async updateUserProfile(
    userId: number,
    profileData: UserProfileUpdateData,
  ): Promise<SelectUser> {
    console.log(`[storage] Updating profile for user ID: ${userId}`);
    try {
      // Filter out any undefined properties to avoid accidentally setting columns to null
      // Although the frontend sends null for empty fields, this is safer.
      const dataToUpdate = Object.entries(profileData).reduce(
        (acc, [key, value]) => {
          if (value !== undefined) {
            // Drizzle handles mapping keys like 'fullName' to 'full_name'
            acc[key as keyof UserProfileUpdateData] = value;
          }
          return acc;
        },
        {} as UserProfileUpdateData,
      );

      if (Object.keys(dataToUpdate).length === 0) {
        console.warn(
          `[storage] No data provided to update profile for user ID: ${userId}`,
        );
        // Optionally fetch and return the current user data if no update occurred
        const currentUser = await this.getUser(userId);
        if (!currentUser)
          throw new Error(
            "User not found after attempting empty profile update.",
          );
        return currentUser;
      }

      const result = await db
        .update(users)
        .set(dataToUpdate) // Pass the filtered data
        .where(eq(users.id, userId))
        .returning(); // Return the updated user row

      if (!result || result.length === 0) {
        console.error(
          `[storage] Failed to update or return updated user profile for ID: ${userId}.`,
        );
        throw new Error("Database failed to return updated user profile.");
      }
      console.log(
        `[storage] Profile updated successfully for user ID: ${userId}`,
      );
      return result[0]; // Return the updated user object
    } catch (error) {
      console.error(
        `[storage] Error updating profile for user ${userId}:`,
        error,
      );
      throw error; // Re-throw
    }
  },
  // --- END NEW FUNCTION ---

  async updateUserPassword(
    userId: number,
    hashedPassword: string,
  ): Promise<void> {
    console.log(`[storage] Updating password for user ID: ${userId}`);
    try {
      await db
        .update(users)
        .set({ password: hashedPassword /*, updatedAt: new Date() */ }) // Optionally update updatedAt if not handled by DB
        .where(eq(users.id, userId));
      console.log(
        `[storage] Password updated successfully for user ID: ${userId}`,
      );
    } catch (error) {
      console.error(
        `[storage] Error updating password for user ${userId}:`,
        error,
      );
      throw error; // Re-throw
    }
  },

  // --- Order Functions ---
  async createOrder(orderData: InsertOrder): Promise<SelectOrder> {
    console.log(
      "[storage] Attempting to create order for userId:",
      orderData.userId,
    );
    try {
      const result = await db
        .insert(orders)
        .values({
          userId: orderData.userId,
          vehicle: orderData.vehicle,
          parts: orderData.parts,
          contactInfo: orderData.contactInfo,
          status: orderData.status || "new",
          // createdAt/updatedAt are handled by DB default
        })
        .returning();

      if (!result || result.length === 0) {
        console.error("[storage] Failed to insert or return created order.");
        throw new Error("Database failed to return created order.");
      }
      console.log(
        "[storage] Order created successfully with ID:",
        result[0].id,
      );
      return result[0];
    } catch (error) {
      console.error("[storage] Error in createOrder:", error);
      throw error;
    }
  },
  async getOrderById(id: number): Promise<SelectOrder | null> {
    try {
      const result = await db
        .select()
        .from(orders)
        .where(eq(orders.id, id))
        .limit(1);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error(`[storage] Error fetching order by ID ${id}:`, error);
      return null;
    }
  },
  async getOrdersByUserId(userId: number): Promise<SelectOrder[]> {
    try {
      const result = await db
        .select()
        .from(orders)
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.createdAt)); // Example ordering
      return result;
    } catch (error) {
      console.error(
        `[storage] Error fetching orders for user ID ${userId}:`,
        error,
      );
      return []; // Return empty array on error
    }
  },

  // --- Contact Message Functions ---
  async createContactMessage(
    messageData: InsertContactMessage,
  ): Promise<SelectContactMessage> {
    console.log(
      "[storage] Attempting to create contact message from:",
      messageData.name,
    );
    try {
      const result = await db
        .insert(contactMessages)
        .values({
          name: messageData.name,
          email: messageData.email,
          phone: messageData.phone,
          countryCode: messageData.countryCode,
          message: messageData.message,
          // createdAt is handled by DB default
        })
        .returning();
      if (!result || result.length === 0) {
        console.error(
          "[storage] Failed to insert or return created contact message.",
        );
        throw new Error("Database failed to return created contact message.");
      }
      console.log(
        "[storage] Contact message created successfully with ID:",
        result[0].id,
      );
      return result[0];
    } catch (error) {
      console.error("[storage] Error in createContactMessage:", error);
      throw error;
    }
  },

  // --- Password Reset Token Functions ---
  async createPasswordResetToken(
    tokenData: InsertPasswordResetToken,
  ): Promise<PasswordResetToken> {
    console.log("[storage] Attempting to create password reset token:", {
      userId: tokenData.userId,
      expiresAt: tokenData.expiresAt,
    }); // Don't log token itself here
    try {
      const result = await db
        .insert(passwordResetTokens)
        .values({
          token: tokenData.token,
          userId: tokenData.userId,
          expiresAt: tokenData.expiresAt,
          used: false, // Explicitly set used to false
          // createdAt is handled by DB default
        })
        .returning(); // <-- Ensures the inserted row data is returned

      console.log("[storage] Token insertion result:", result); // Log what DB returns

      if (!result || result.length === 0) {
        console.error(
          "[storage] Failed to insert or return password reset token from DB.",
        );
        throw new Error(
          "Database failed to return created password reset token.",
        );
      }
      // Drizzle returns an array, return the first element which is the created token object
      console.log(
        "[storage] Password reset token created in DB with ID:",
        result[0].id,
      );
      return result[0];
    } catch (error) {
      console.error(
        "[storage] Error executing createPasswordResetToken DB query:",
        error,
      );
      throw error; // Re-throw the error to be handled by the caller in routes.ts
    }
  },

  async getPasswordResetToken(
    token: string,
  ): Promise<PasswordResetToken | null> {
    console.log(
      `[storage] Getting password reset token (first few chars): ${token.substring(0, 5)}...`,
    );
    try {
      const result = await db
        .select()
        .from(passwordResetTokens)
        .where(eq(passwordResetTokens.token, token))
        .limit(1);
      console.log(
        `[storage] Found token data for ${token.substring(0, 5)}... ?`,
        result.length > 0,
      );
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error(
        `[storage] Error fetching password reset token ${token.substring(0, 5)}...:`,
        error,
      );
      return null;
    }
  },

  async markTokenAsUsed(token: string): Promise<void> {
    console.log(`[storage] Marking token as used: ${token.substring(0, 5)}...`);
    try {
      const result = await db
        .update(passwordResetTokens)
        .set({ used: true })
        .where(eq(passwordResetTokens.token, token));
      console.log(
        `[storage] Marked token as used result (affected rows):`,
        result.rowCount,
      );
    } catch (error) {
      console.error(
        `[storage] Error marking token ${token.substring(0, 5)}... as used:`,
        error,
      );
      throw error; // Important to throw if this fails
    }
  },

  async deleteExpiredTokens(): Promise<void> {
    console.log("[storage] Deleting expired password reset tokens...");
    try {
      const now = new Date();
      // Ensure the comparison is correct based on your DB setup (>= or >)
      const result = await db
        .delete(passwordResetTokens)
        .where(sql`${now} >= ${passwordResetTokens.expiresAt}`);
      console.log(`[storage] Deleted ${result.rowCount} expired tokens.`);
    } catch (error) {
      console.error("[storage] Error deleting expired tokens:", error);
      // Decide if you need to throw here or just log depending on impact
    }
  },
}; // End of storage object
