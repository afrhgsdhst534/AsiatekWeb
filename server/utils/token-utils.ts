// FILE: server/utils/token-utils.ts (Add explicit validation checks)
// Replace ENTIRE file content

import crypto from "crypto";
import { storage } from "../storage.js"; // Adjust path
import type {
    PasswordResetToken,
    InsertPasswordResetToken,
} from "@shared/schema"; // Adjust path

// --- TOKEN GENERATION ---
export const generatePasswordResetToken = async (
    userId: number,
): Promise<PasswordResetToken> => {
    // ... (keep existing generate logic) ...
    console.log(
        `[token-utils->generatePasswordResetToken] Generating for userId: ${userId}`,
    );
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour
    const tokenData: InsertPasswordResetToken = {
        token,
        userId,
        expiresAt,
        used: false,
    };
    try {
        console.log(
            `[token-utils->generatePasswordResetToken] Calling storage.createPasswordResetToken...`,
        );
        const createdToken = await storage.createPasswordResetToken(tokenData);
        console.log(
            `[token-utils->generatePasswordResetToken] Received from storage.createPasswordResetToken:`,
            createdToken,
        );
        if (
            !createdToken ||
            typeof createdToken !== "object" ||
            !createdToken.token
        ) {
            console.error(
                `[token-utils->generatePasswordResetToken] storage function returned invalid data:`,
                createdToken,
            );
            throw new Error(
                "Storage function failed to return a valid token object.",
            );
        }
        console.log(
            `[token-utils->generatePasswordResetToken] Successfully generated and received token object. Returning it.`,
        );
        return createdToken;
    } catch (error) {
        console.error(
            `[token-utils->generatePasswordResetToken] Error calling or processing result from storage.createPasswordResetToken:`,
            error,
        );
        throw error;
    }
};

// --- TOKEN VERIFICATION ---
export const verifyPasswordResetToken = async (
    token: string,
): Promise<PasswordResetToken | null> => {
    console.log(
        `[token-utils->verifyPasswordResetToken] Verifying token (first 5): ${token.substring(0, 5)}...`,
    );
    try {
        // 1. Get token data from storage
        const tokenData = await storage.getPasswordResetToken(token);

        // 2. Check if token exists in DB
        if (!tokenData) {
            console.log(
                `[token-utils->verifyPasswordResetToken] Token not found in storage.`,
            );
            return null; // Causes 400 response
        }
        console.log(
            `[token-utils->verifyPasswordResetToken] Token found in storage. ID: ${tokenData.id}, Used: ${tokenData.used}, Expires: ${tokenData.expiresAt}`,
        );

        // *** 3. ADD/ENSURE EXPLICIT CHECKS HERE ***
        const now = new Date();
        if (tokenData.used) {
            console.warn(
                `[token-utils->verifyPasswordResetToken] Token ID ${tokenData.id} has already been used.`,
            );
            return null; // Causes 400 response
        }
        if (now > new Date(tokenData.expiresAt)) {
            // Compare dates correctly
            console.warn(
                `[token-utils->verifyPasswordResetToken] Token ID ${tokenData.id} has expired. Expiry: ${tokenData.expiresAt}, Now: ${now}`,
            );
            // Optionally delete the token here if expired
            // await storage.deleteExpiredTokens(); // Or delete just this one
            return null; // Causes 400 response
        }
        // *** END EXPLICIT CHECKS ***

        // If all checks pass, token is valid
        console.log(
            `[token-utils->verifyPasswordResetToken] Token ID ${tokenData.id} verified successfully.`,
        );
        return tokenData;
    } catch (error) {
        console.error(
            `[token-utils->verifyPasswordResetToken] Error calling storage.getPasswordResetToken:`,
            error,
        );
        return null; // Treat storage errors as verification failure
    }
};

// --- TOKEN CONSUMPTION ---
export const consumePasswordResetToken = async (
    token: string,
): Promise<void> => {
    // ... (keep existing consume logic) ...
    console.log(
        `[token-utils->consumePasswordResetToken] Consuming token (first 5): ${token.substring(0, 5)}...`,
    );
    try {
        await storage.markTokenAsUsed(token);
        console.log(
            `[token-utils->consumePasswordResetToken] Token marked as used successfully.`,
        );
    } catch (error) {
        console.error(
            `[token-utils->consumePasswordResetToken] Error calling storage.markTokenAsUsed:`,
            error,
        );
        throw error;
    }
};
