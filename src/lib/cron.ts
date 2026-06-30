import { prisma } from "./db";
import { getTelegramClient } from "./telegram";

let isRunning = false;

export async function runLazyCron() {
  // Prevent concurrent runs
  if (isRunning) return;
  isRunning = true;

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const expiredFiles = await prisma.file.findMany({
      where: {
        isDeleted: true,
        deletedAt: {
          lt: thirtyDaysAgo
        }
      }
    });

    if (expiredFiles.length === 0) {
      isRunning = false;
      return;
    }

    const client = await getTelegramClient();
    if (!client) {
      console.error("[CRON] Telegram client unavailable");
      isRunning = false;
      return;
    }

    const messageIds = expiredFiles.map(f => f.telegramMessageId);
    
    // Delete from Telegram
    await client.deleteMessages(process.env.TELEGRAM_CHANNEL_ID!, messageIds, {
      revoke: true
    });

    // Delete from SQLite
    await prisma.file.deleteMany({
      where: {
        id: { in: expiredFiles.map(f => f.id) }
      }
    });

    console.log(`[CRON] Successfully cleaned up ${expiredFiles.length} expired trash files.`);
  } catch (error) {
    console.error("[CRON] Error running lazy cron:", error);
  } finally {
    isRunning = false;
  }
}
