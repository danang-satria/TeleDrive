import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { CustomFile } from "telegram/client/uploads";
import fs from "fs";
import path from "path";
import { prisma } from "./db";

const apiId = parseInt(process.env.TELEGRAM_API_ID || "0");
const apiHash = process.env.TELEGRAM_API_HASH || "";

let client: TelegramClient | null = null;

export class TelegramSessionExpired extends Error {
  constructor(message = "Telegram session has expired or is invalid.") {
    super(message);
    this.name = "TelegramSessionExpired";
  }
}

export function resetTelegramClient() {
  if (client) {
    try { client.disconnect(); } catch (e) {}
  }
  client = null;
}

export async function getTelegramClient() {
  if (!client) {
    const config = await prisma.appConfig.findUnique({ where: { key: "TELEGRAM_SESSION" } });
    const sessionString = config?.value || process.env.TELEGRAM_SESSION || "";
    
    if (!sessionString) {
      throw new TelegramSessionExpired("No Telegram session string provided.");
    }

    let stringSession;
    try {
      stringSession = new StringSession(sessionString);
    } catch (e) {
      throw new TelegramSessionExpired("Invalid session string format.");
    }
    
    client = new TelegramClient(stringSession, apiId, apiHash, {
      connectionRetries: 1,
    });

    try {
      await client.connect();
    } catch (error) {
      client = null;
      throw new TelegramSessionExpired();
    }
  }
  return client;
}

export async function uploadToTelegram(filePath: string, fileName: string) {
  const client = await getTelegramClient();
  let channelId: any = process.env.TELEGRAM_CHANNEL_ID || "me";
  
  if (typeof channelId === "string" && channelId !== "me" && !isNaN(Number(channelId))) {
      channelId = BigInt(channelId);
  }

  const stat = fs.statSync(filePath);
  const customFile = new CustomFile(fileName, stat.size, filePath);

  const result = await client.sendFile(channelId, {
    file: customFile,
    forceDocument: true,
    caption: fileName,
  });

  return result.id;
}

export async function downloadFromTelegram(messageId: number) {
  const client = await getTelegramClient();
  let channelId: any = process.env.TELEGRAM_CHANNEL_ID || "me";
  if (typeof channelId === "string" && channelId !== "me" && !isNaN(Number(channelId))) {
      channelId = BigInt(channelId);
  }

  const messages = await client.getMessages(channelId, { ids: [messageId] });
  if (messages.length === 0 || !messages[0].media) {
    throw new Error("Message or media not found");
  }

  const buffer = await client.downloadMedia(messages[0]);
  return buffer;
}

export async function deleteFromTelegram(messageId: number) {
  const client = await getTelegramClient();
  let channelId: any = process.env.TELEGRAM_CHANNEL_ID || "me";
  if (typeof channelId === "string" && channelId !== "me" && !isNaN(Number(channelId))) {
      channelId = BigInt(channelId);
  }
  
  await client.deleteMessages(channelId, [messageId], { revoke: true });
}
