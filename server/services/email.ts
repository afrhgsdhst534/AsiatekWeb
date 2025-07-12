// FILE: server/services/email.ts (Fix escapeHtml function - CORRECTED THIS TIME)
// Replace ENTIRE file content

import { Resend } from "resend";
import type {
  Part,
  Vehicle,
  ContactInfo,
  Order,
  PasswordResetToken,
  InsertContactMessage, // <-- Import type for contact form data
} from "@shared/schema"; // Adjust path if needed

// --- Resend Setup ---
const resendApiKey = process.env.RESEND_API_KEY;
if (!resendApiKey) {
  console.warn(
    "WARNING: RESEND_API_KEY environment variable is not set. Email sending will fail.",
  );
}
const resend = new Resend(resendApiKey);

// --- Base URL Setup (Production Logic) ---
const getBaseUrl = () => {
  console.log(
    `[getBaseUrl] Checking environment variables for production URL...`,
  );
  console.log(`[getBaseUrl] NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`[getBaseUrl] PUBLIC_BASE_URL: ${process.env.PUBLIC_BASE_URL}`);
  console.log(`[getBaseUrl] REPLIT_URL: ${process.env.REPLIT_URL}`);

  if (
    process.env.PUBLIC_BASE_URL &&
    typeof process.env.PUBLIC_BASE_URL === "string" &&
    process.env.PUBLIC_BASE_URL.trim() !== ""
  ) {
    console.log(
      `[getBaseUrl] Using PUBLIC_BASE_URL: ${process.env.PUBLIC_BASE_URL}`,
    );
    const url = process.env.PUBLIC_BASE_URL;
    return url.endsWith("/") ? url.slice(0, -1) : url;
  }

  if (
    process.env.REPLIT_URL &&
    typeof process.env.REPLIT_URL === "string" &&
    process.env.REPLIT_URL.trim() !== ""
  ) {
    console.warn(
      `[getBaseUrl] Warning: PUBLIC_BASE_URL Secret not set. Falling back to REPLIT_URL: ${process.env.REPLIT_URL}`,
    );
    const url = process.env.REPLIT_URL.startsWith("https://")
      ? process.env.REPLIT_URL
      : `https://${process.env.REPLIT_URL}`;
    return url.endsWith("/") ? url.slice(0, -1) : url;
  }

  console.error(
    "[getBaseUrl] CRITICAL WARNING: PUBLIC_BASE_URL and REPLIT_URL environment variables not found! Falling back to default custom domain. Ensure PUBLIC_BASE_URL Secret is set in Replit!",
  );
  return "https://asiatek.pro";
};
const BASE_URL = getBaseUrl();
console.log(
  `[email.ts] BASE_URL determined for production/deployment as: ${BASE_URL}`,
);

// --- Helper Functions ---
const formatDate = (date: Date): string => {
  return date.toLocaleString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow",
  });
};

// Simple HTML escape helper
const escapeHtml = (unsafe: string | undefined | null): string => {
  if (!unsafe) return "";
  // Ensure all replacements happen on the original string unsafe
  return unsafe
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/'/g, "'");
};

// --- HTML Generators ---

// Generate order confirmation email HTML
const generateOrderConfirmationHTML = (
  order: Order,
  vehicle: Vehicle,
  parts: Part[],
  contactInfo: ContactInfo,
): string => {
  const styles = `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; line-height: 1.6; color: #333; background-color: #f7f7f7; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
    .header { background-color: #f1f1f1; padding: 15px 20px; border-bottom: 1px solid #e0e0e0; }
    .header h1 { margin: 0; color: #1a1a1a; font-size: 22px; }
    .content { padding: 20px; }
    h2 { color: #333; border-bottom: 1px solid #eee; padding-bottom: 8px; font-size: 18px; margin-top: 25px; margin-bottom: 15px; }
    p { margin: 5px 0 15px 0; font-size: 15px; }
    strong { font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; }
    table, th, td { border: 1px solid #e0e0e0; }
    th, td { padding: 10px 12px; text-align: left; }
    th { background-color: #f9f9f9; font-weight: 600; }
    .footer { text-align: center; margin-top: 20px; padding: 15px; font-size: 12px; color: #888; background-color: #f7f7f7; }
  `;

  const vehicleInfo = vehicle
    ? vehicle.vin
      ? `<p><strong>VIN:</strong> ${escapeHtml(vehicle.vin)}</p>`
      : `
      <p><strong>Марка:</strong> ${escapeHtml(vehicle.make) || "Не указана"}</p>
      <p><strong>Модель:</strong> ${escapeHtml(vehicle.model) || "Не указана"}</p>
      <p><strong>Год:</strong> ${vehicle.year || "-"}</p>
      ${vehicle.engineVolume ? `<p><strong>Объем двигателя:</strong> ${escapeHtml(vehicle.engineVolume)}</p>` : ""}
      ${vehicle.fuelType ? `<p><strong>Тип топлива:</strong> ${escapeHtml(vehicle.fuelType)}</p>` : ""}
    `
    : "<p>Информация об автомобиле не предоставлена.</p>";

  const partsTable =
    parts && parts.length > 0
      ? `
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Название</th>
          <th>Артикул</th>
          <th>Кол-во</th>
          <th>Бренд</th>
          <th>Комментарий</th>
        </tr>
      </thead>
      <tbody>
        ${parts
          .map(
            (part, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(part?.name) || "-"}</td>
            <td>${escapeHtml(part?.sku) || "-"}</td>
            <td>${part?.quantity || "-"}</td>
            <td>${escapeHtml(part?.brand) || "-"}</td>
            <td>${escapeHtml(part?.description) || "-"}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  `
      : "<p>Список запчастей не указан.</p>";

  return `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"><title>Уведомление о новом заказе #${order.id}</title><style>${styles}</style></head>
    <body>
      <div class="container">
        <div class="header"><h1>Новый заказ #${order.id}</h1></div>
        <div class="content">
          <p>Здравствуйте,</p>
          <p>Получен новый заказ на сайте Asiatek.pro.</p>
          <p><strong>Дата и время:</strong> ${formatDate(new Date(order.createdAt))}</p>

          <h2>Контактная информация</h2>
          <p><strong>Имя:</strong> ${escapeHtml(contactInfo?.name) || "Не указано"}</p>
          <p><strong>Email:</strong> ${escapeHtml(contactInfo?.email) || "-"}</p>
          <p><strong>Телефон:</strong> ${escapeHtml(contactInfo?.phone) || "-"} (${escapeHtml(contactInfo?.countryCode) || "-"})</p>
          <p><strong>Город:</strong> ${escapeHtml(contactInfo?.city) || "-"}</p>
          ${contactInfo?.comments ? `<p><strong>Комментарий к заказу:</strong> ${escapeHtml(contactInfo.comments)}</p>` : ""}

          <h2>Информация об автомобиле</h2>
          <p><strong>Тип ТС:</strong> ${escapeHtml(vehicle?.type) || "Не указан"}</p>
          ${vehicleInfo}

          <h2>Запрошенные запчасти (${parts?.length || 0})</h2>
          ${partsTable}

          <p>Пожалуйста, свяжитесь с клиентом для подтверждения и обработки заказа.</p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Asiatek.pro. Все права защищены.</p>
        </div>
      </div>
    </body></html>
  `;
};

// Generate password reset email HTML
const generatePasswordResetHTML = (resetLink: string): string => {
  const styles = `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; line-height: 1.6; color: #333; background-color: #f7f7f7; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
    .header { background-color: #f1f1f1; padding: 15px 20px; border-bottom: 1px solid #e0e0e0; }
    .header h1 { margin: 0; color: #1a1a1a; font-size: 22px; }
    .content { padding: 30px 20px; }
    p { margin: 15px 0; font-size: 15px; }
    .button-container { text-align: center; margin: 30px 0; }
    .button { display: inline-block; background-color: #CF0000; color: #ffffff !important; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; border: none; cursor: pointer; }
    .link { color: #007bff; text-decoration: none; word-break: break-all; }
    .link:hover { text-decoration: underline; }
    .footer { text-align: center; margin-top: 20px; padding: 15px; font-size: 12px; color: #888; background-color: #f7f7f7; }
  `;

  return `
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"><title>Сброс пароля - Asiatek.pro</title><style>${styles}</style></head>
    <body>
      <div class="container">
        <div class="header"><h1>Запрос на сброс пароля</h1></div>
        <div class="content">
          <p>Здравствуйте,</p>
          <p>Мы получили запрос на сброс пароля для вашего аккаунта на Asiatek.pro.</p>
          <p>Нажмите кнопку ниже, чтобы установить новый пароль. Ссылка действительна в течение 1 часа.</p>

          <div class="button-container">
            <a href="${resetLink}" target="_blank" class="button" style="color: #ffffff;">Установить новый пароль</a>
          </div>

          <p>Если кнопка не работает, скопируйте и вставьте следующую ссылку в адресную строку вашего браузера:</p>
          <p><a href="${resetLink}" target="_blank" class="link">${escapeHtml(resetLink)}</a></p>

          <p>Если вы не запрашивали сброс пароля, пожалуйста, проигнорируйте это письмо. Ваша учетная запись в безопасности.</p>
        </div>
        <div class="footer">
          <p>Это письмо отправлено автоматически с сайта Asiatek.pro.</p>
          <p>© ${new Date().getFullYear()} Asiatek.pro. Все права защищены.</p>
        </div>
      </div>
    </body></html>
  `;
};

// Generate Contact Form Notification HTML
const generateContactNotificationHTML = (
  formData: InsertContactMessage,
): string => {
  const styles = `
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; line-height: 1.6; color: #333; background-color: #f7f7f7; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
      .header { background-color: #f1f1f1; padding: 15px 20px; border-bottom: 1px solid #e0e0e0; }
      .header h1 { margin: 0; color: #1a1a1a; font-size: 22px; }
      .content { padding: 20px; }
      h2 { color: #333; font-size: 18px; margin-top: 20px; margin-bottom: 10px; }
      p { margin: 5px 0 15px 0; font-size: 15px; }
      strong { font-weight: 600; }
      blockquote { background-color: #f9f9f9; border-left: 4px solid #ccc; margin: 15px 0; padding: 10px 15px; font-style: italic; white-space: pre-wrap; word-wrap: break-word; }
      .footer { text-align: center; margin-top: 20px; padding: 15px; font-size: 12px; color: #888; background-color: #f7f7f7; }
    `;

  return `
      <!DOCTYPE html>
      <html><head><meta charset="utf-8"><title>Новое сообщение с формы контактов</title><style>${styles}</style></head>
      <body>
        <div class="container">
          <div class="header"><h1>Новое сообщение с формы контактов</h1></div>
          <div class="content">
            <p>Получено новое сообщение через контактную форму на сайте Asiatek.pro.</p>

            <h2>Данные отправителя</h2>
            <p><strong>Имя:</strong> ${escapeHtml(formData.name) || "Не указано"}</p>
            <p><strong>Email:</strong> ${escapeHtml(formData.email) || "-"}</p>
            <p><strong>Телефон:</strong> ${escapeHtml(formData.phone) || "-"} (${escapeHtml(formData.countryCode) || "-"})</p>

            <h2>Сообщение</h2>
            <blockquote>${escapeHtml(formData.message) || "Сообщение не предоставлено."}</blockquote>

            <p>Пожалуйста, ответьте на это обращение при необходимости.</p>
          </div>
          <div class="footer">
            <p>Это письмо отправлено автоматически с сайта Asiatek.pro.</p>
            <p>© ${new Date().getFullYear()} Asiatek.pro. Все права защищены.</p>
          </div>
        </div>
      </body></html>
    `;
};

// --- Email Sending Service ---
export const emailService = {
  async sendOrderConfirmation(
    order: Order,
    vehicle: Vehicle,
    parts: Part[],
    contactInfo: ContactInfo,
  ): Promise<{ success: boolean; error?: string }> {
    if (!resendApiKey) {
      console.error(
        "[emailService.sendOrderConfirmation] Aborting: Resend API key not configured.",
      );
      return { success: false, error: "Resend API key not configured." };
    }
    try {
      const html = generateOrderConfirmationHTML(
        order,
        vehicle,
        parts,
        contactInfo,
      );
      const recipient =
        process.env.ORDER_NOTIFICATION_EMAIL || "asiatek.pro@outlook.com";
      console.log(
        `[emailService.sendOrderConfirmation] Attempting to send order confirmation to ${recipient} for Order #${order.id}`,
      );

      const response = await resend.emails.send({
        from: process.env.EMAIL_FROM_ADDRESS || "orders@asiatek.pro",
        to: recipient,
        subject: `Новый заказ #${order.id} - ${escapeHtml(contactInfo.name) || "Клиент"}`,
        html: html,
        reply_to: contactInfo.email || undefined,
      });

      console.log(
        `[emailService.sendOrderConfirmation] Resend API response for Order #${order.id}:`,
        response,
      );

      if (response.error) {
        console.error(
          "[emailService.sendOrderConfirmation] Resend API returned an error:",
          response.error,
        );
        return {
          success: false,
          error: response.error.message || "Resend API error",
        };
      }

      console.log(
        `[emailService.sendOrderConfirmation] Order confirmation for #${order.id} sent successfully.`,
      );
      return { success: true };
    } catch (error) {
      console.error(
        `[emailService.sendOrderConfirmation] Failed inside try...catch for Order #${order.id}:`,
        error,
      );
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error sending order confirmation",
      };
    }
  },

  async sendPasswordResetEmail(
    email: string,
    resetToken: PasswordResetToken,
  ): Promise<{ success: boolean; error?: string }> {
    if (!resendApiKey) {
      console.error(
        "[emailService.sendPasswordResetEmail] Aborting: Resend API key not configured.",
      );
      return { success: false, error: "Resend API key not configured." };
    }
    try {
      if (!resetToken || !resetToken.token) {
        console.error(
          "[emailService.sendPasswordResetEmail] Aborting: Invalid resetToken object received.",
        );
        return { success: false, error: "Invalid reset token provided." };
      }

      const resetPath = `/auth/reset-password?token=${resetToken.token}`;
      const resetLink = `${BASE_URL}${resetPath}`;
      console.log(
        `[sendPasswordResetEmail] Generated password reset link for production: ${resetLink}`,
      );

      const html = generatePasswordResetHTML(resetLink);
      if (!html || !html.includes("<!DOCTYPE html>")) {
        console.error(
          "[emailService.sendPasswordResetEmail] Error: generatePasswordResetHTML returned invalid content.",
        );
        return { success: false, error: "Failed to generate email content." };
      }

      console.log(
        `[sendPasswordResetEmail] Attempting to send to ${email} using Resend...`,
      );
      const response = await resend.emails.send({
        from: process.env.EMAIL_FROM_ADDRESS || "no-reply@asiatek.pro",
        to: email,
        subject: "Сброс пароля - Asiatek.pro",
        html: html,
      });
      console.log(`[sendPasswordResetEmail] Resend API response:`, response);

      if (response.error) {
        console.error(
          "[sendPasswordResetEmail] Resend API returned an error:",
          response.error,
        );
        return {
          success: false,
          error: response.error.message || "Resend API error",
        };
      }

      console.log(
        `[sendPasswordResetEmail] Email sent successfully to ${email}.`,
      );
      return { success: true };
    } catch (error) {
      console.error(
        "[sendPasswordResetEmail] Failed inside try...catch:",
        error,
      );
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error sending password reset email",
      };
    }
  },

  async sendContactFormNotification(
    formData: InsertContactMessage,
  ): Promise<{ success: boolean; error?: string }> {
    if (!resendApiKey) {
      console.error(
        "[emailService.sendContactFormNotification] Aborting: Resend API key not configured.",
      );
      return { success: false, error: "Resend API key not configured." };
    }
    try {
      const html = generateContactNotificationHTML(formData);
      const adminEmail = "asiatek.pro@outlook.com"; // The target admin email
      const subject = `Новое сообщение от ${escapeHtml(formData.name) || "Посетитель"}`;

      console.log(
        `[emailService.sendContactFormNotification] Attempting to send contact form notification to ${adminEmail}`,
      );

      const response = await resend.emails.send({
        from: process.env.EMAIL_FROM_ADDRESS || "contact-form@asiatek.pro", // Use a specific 'from' if desired
        to: adminEmail,
        subject: subject,
        html: html,
        reply_to: formData.email || undefined, // Set reply-to if email provided
      });

      console.log(
        `[emailService.sendContactFormNotification] Resend API response:`,
        response,
      );

      if (response.error) {
        console.error(
          "[emailService.sendContactFormNotification] Resend API returned an error:",
          response.error,
        );
        return {
          success: false,
          error: response.error.message || "Resend API error",
        };
      }

      console.log(
        `[emailService.sendContactFormNotification] Contact notification sent successfully to ${adminEmail}.`,
      );
      return { success: true };
    } catch (error) {
      console.error(
        `[emailService.sendContactFormNotification] Failed inside try...catch:`,
        error,
      );
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error sending contact form notification",
      };
    }
  },
}; // End of emailService object
