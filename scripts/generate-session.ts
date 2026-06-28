import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import * as readline from "readline";
import * as dotenv from "dotenv";

dotenv.config();

const apiId = parseInt(process.env.TELEGRAM_API_ID || "0");
const apiHash = process.env.TELEGRAM_API_HASH || "";
const stringSession = new StringSession("");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

(async () => {
  if (!apiId || !apiHash) {
    console.error("Please set TELEGRAM_API_ID and TELEGRAM_API_HASH in your .env file before running this script.");
    process.exit(1);
  }

  console.log("Loading interactive example...");
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await askQuestion("Please enter your phone number (e.g., +1234567890): "),
    password: async () => await askQuestion("Please enter your password (if you have 2FA enabled, otherwise just press enter): "),
    phoneCode: async () => await askQuestion("Please enter the code you received on Telegram: "),
    onError: (err) => console.log(err),
  });

  console.log("You should now be connected.");
  console.log("Copy the following session string to your .env file as TELEGRAM_SESSION:");
  console.log("\n");
  console.log(client.session.save());
  console.log("\n");

  await client.disconnect();
  process.exit(0);
})();
