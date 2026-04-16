import nodemailer, { Transporter } from "nodemailer";

interface NotificationPayload {
  userId: number;
  type:
    | "DEADLINE_REMINDER"
    | "TASK_OVERDUE"
    | "PANIC_MODE_ACTIVATED"
    | "TASK_COMPLETED"
    | "SCHEDULE_CHANGED";
  title: string;
  message: string;
  data?: Record<string, any>;
  recipient: string; // email or Telegram chat ID
}

export class NotificationService {
  private static emailTransporter: Transporter | null = null;

  /**
   * Initialize email transporter
   */
  private static initEmailTransporter(): Transporter {
    if (this.emailTransporter) {
      return this.emailTransporter;
    }

    // Configure based on environment
    const emailConfig = {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    };

    this.emailTransporter = nodemailer.createTransport(emailConfig);
    return this.emailTransporter;
  }

  /**
   * Send email notification
   */
  static async sendEmailNotification(
    recipient: string,
    subject: string,
    htmlContent: string,
  ): Promise<boolean> {
    try {
      if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
        console.warn(
          "Email configuration missing, skipping email notification",
        );
        return false;
      }

      const transporter = this.initEmailTransporter();
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: recipient,
        subject,
        html: htmlContent,
      });

      console.log(`Email sent to ${recipient}`);
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  }

  /**
   * Send Telegram notification
   */
  static async sendTelegramNotification(
    chatId: string,
    message: string,
  ): Promise<boolean> {
    try {
      if (!process.env.TELEGRAM_BOT_TOKEN) {
        console.warn("Telegram bot token not configured");
        return false;
      }

      const response = await fetch(
        "https://api.telegram.org/bot" +
          process.env.TELEGRAM_BOT_TOKEN +
          "/sendMessage",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: "HTML",
          }),
        },
      );

      if (!response.ok) {
        console.error("Telegram API error:", response.statusText);
        return false;
      }

      console.log(`Telegram message sent to ${chatId}`);
      return true;
    } catch (error) {
      console.error("Error sending Telegram notification:", error);
      return false;
    }
  }

  /**
   * Send deadline reminder notification
   */
  static async sendDeadlineReminder(
    recipient: string,
    taskTitle: string,
    dueDate: Date,
    notificationMethod: "EMAIL" | "TELEGRAM" | "BOTH" = "EMAIL",
  ): Promise<boolean> {
    try {
      const hoursUntil = (dueDate.getTime() - Date.now()) / (1000 * 60 * 60);
      const timeText =
        hoursUntil < 24
          ? `${Math.round(hoursUntil)} giờ nữa`
          : `${Math.round(hoursUntil / 24)} ngày nữa`;

      if (notificationMethod === "EMAIL" || notificationMethod === "BOTH") {
        const htmlContent = this.getDeadlineReminderEmail(
          taskTitle,
          timeText,
          dueDate,
        );
        await this.sendEmailNotification(
          recipient,
          `⏰ Deadline Reminder: ${taskTitle}`,
          htmlContent,
        );
      }

      if (notificationMethod === "TELEGRAM" || notificationMethod === "BOTH") {
        const message = `⏰ <b>Deadline Reminder</b>\n\nTask: <b>${taskTitle}</b>\nDue: ${timeText}\n\n#deadline #reminder`;
        await this.sendTelegramNotification(recipient, message);
      }

      return true;
    } catch (error) {
      console.error("Error sending deadline reminder:", error);
      return false;
    }
  }

  /**
   * Send task overdue notification
   */
  static async sendTaskOverdueNotification(
    recipient: string,
    taskTitle: string,
    delayTime: string,
    notificationMethod: "EMAIL" | "TELEGRAM" | "BOTH" = "EMAIL",
  ): Promise<boolean> {
    try {
      if (notificationMethod === "EMAIL" || notificationMethod === "BOTH") {
        const htmlContent = this.getTaskOverdueEmail(taskTitle, delayTime);
        await this.sendEmailNotification(
          recipient,
          `⚠️ Task Overdue: ${taskTitle}`,
          htmlContent,
        );
      }

      if (notificationMethod === "TELEGRAM" || notificationMethod === "BOTH") {
        const message = `⚠️ <b>Task Overdue</b>\n\nTask: <b>${taskTitle}</b>\nDelay: ${delayTime}\n\n#overdue #urgent`;
        await this.sendTelegramNotification(recipient, message);
      }

      return true;
    } catch (error) {
      console.error("Error sending overdue notification:", error);
      return false;
    }
  }

  /**
   * Send panic mode activated notification
   */
  static async sendPanicModeActivatedNotification(
    recipient: string,
    cancelledCount: number,
    bufferedCount: number,
    notificationMethod: "EMAIL" | "TELEGRAM" | "BOTH" = "EMAIL",
  ): Promise<boolean> {
    try {
      if (notificationMethod === "EMAIL" || notificationMethod === "BOTH") {
        const htmlContent = this.getPanicModeEmail(
          cancelledCount,
          bufferedCount,
        );
        await this.sendEmailNotification(
          recipient,
          "🚨 Panic Mode Activated - Schedule Optimized",
          htmlContent,
        );
      }

      if (notificationMethod === "TELEGRAM" || notificationMethod === "BOTH") {
        const message =
          `🚨 <b>Panic Mode Activated</b>\n\n` +
          `Cancelled: ${cancelledCount} tasks\n` +
          `Buffered: ${bufferedCount} critical tasks\n\n` +
          `#panicmode #schedule`;
        await this.sendTelegramNotification(recipient, message);
      }

      return true;
    } catch (error) {
      console.error("Error sending panic mode notification:", error);
      return false;
    }
  }

  /**
   * Send task completed notification
   */
  static async sendTaskCompletedNotification(
    recipient: string,
    taskTitle: string,
    efficiencyRate: number,
    notificationMethod: "EMAIL" | "TELEGRAM" | "BOTH" = "EMAIL",
  ): Promise<boolean> {
    try {
      if (notificationMethod === "EMAIL" || notificationMethod === "BOTH") {
        const htmlContent = this.getTaskCompletedEmail(
          taskTitle,
          efficiencyRate,
        );
        await this.sendEmailNotification(
          recipient,
          `✅ Task Completed: ${taskTitle}`,
          htmlContent,
        );
      }

      if (notificationMethod === "TELEGRAM" || notificationMethod === "BOTH") {
        const message =
          `✅ <b>Task Completed</b>\n\n` +
          `Task: <b>${taskTitle}</b>\n` +
          `Efficiency: ${efficiencyRate.toFixed(1)}%\n\n` +
          `#completed #progress`;
        await this.sendTelegramNotification(recipient, message);
      }

      return true;
    } catch (error) {
      console.error("Error sending task completed notification:", error);
      return false;
    }
  }

  // HTML Email Templates
  private static getDeadlineReminderEmail(
    taskTitle: string,
    timeText: string,
    dueDate: Date,
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #fff3cd; border-left: 4px solid #ff9800; padding: 16px; margin-bottom: 16px;">
          <h2 style="color: #ff6f00; margin-top: 0;">⏰ Reminder: Upcoming Deadline</h2>
        </div>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 4px;">
          <p><strong>Task:</strong> ${taskTitle}</p>
          <p><strong>Due in:</strong> ${timeText}</p>
          <p><strong>Due date:</strong> ${dueDate.toLocaleString("vi-VN")}</p>
        </div>
        <div style="margin-top: 16px; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_API_URL}/tasks" style="background: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
            View Task
          </a>
        </div>
      </div>
    `;
  }

  private static getTaskOverdueEmail(
    taskTitle: string,
    delayTime: string,
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #ffebee; border-left: 4px solid #f44336; padding: 16px; margin-bottom: 16px;">
          <h2 style="color: #c62828; margin-top: 0;">⚠️ Task Overdue</h2>
        </div>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 4px;">
          <p><strong>Task:</strong> ${taskTitle}</p>
          <p><strong>Delay:</strong> ${delayTime}</p>
          <p style="color: #d32f2f; font-weight: bold;">Please complete this task as soon as possible.</p>
        </div>
      </div>
    `;
  }

  private static getPanicModeEmail(
    cancelledCount: number,
    bufferedCount: number,
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #ffe0b2; border-left: 4px solid #ff5722; padding: 16px; margin-bottom: 16px;">
          <h2 style="color: #e64a19; margin-top: 0;">🚨 Panic Mode Activated</h2>
        </div>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 4px;">
          <p>Your schedule has been automatically optimized:</p>
          <ul>
            <li><strong>${cancelledCount}</strong> non-critical tasks cancelled</li>
            <li><strong>${bufferedCount}</strong> critical tasks buffered</li>
          </ul>
          <p>Focus on what matters most! 💪</p>
        </div>
      </div>
    `;
  }

  private static getTaskCompletedEmail(
    taskTitle: string,
    efficiencyRate: number,
  ): string {
    const emoji =
      efficiencyRate >= 90 ? "🌟" : efficiencyRate >= 75 ? "👍" : "📈";
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 16px; margin-bottom: 16px;">
          <h2 style="color: #2e7d32; margin-top: 0;">✅ Task Completed</h2>
        </div>
        <div style="background: #f5f5f5; padding: 16px; border-radius: 4px;">
          <p><strong>Task:</strong> ${taskTitle}</p>
          <p><strong>Efficiency:</strong> ${emoji} ${efficiencyRate.toFixed(1)}%</p>
          <p style="color: #2e7d32; font-weight: bold;">Great job! Keep up the momentum.</p>
        </div>
      </div>
    `;
  }
}
