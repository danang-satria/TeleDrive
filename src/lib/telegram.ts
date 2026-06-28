import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { CustomFile } from "telegram/client/uploads";
import fs from "fs";
import path from "path";

const apiId = parseInt(process.env.TELEGRAM_API_ID || "0");
const apiHash = process.env.TELEGRAM_API_HASH || "";
const sessionString = process.env.TELEGRAM_SESSION || "";
const stringSession = new StringSession(sessionString);

let client: TelegramClient | null = null;

export async function getTelegramClient() {
  if (!client) {
    client = new TelegramClient(stringSession, apiId, apiHash, {
      connectionRetries: 5,
    });
    await client.connect();
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
