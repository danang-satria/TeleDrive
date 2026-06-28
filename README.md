# TeleDrive ☁️

TeleDrive is a personal cloud storage web application built to mimic the experience of Google Drive, but utilizing **Telegram** as the underlying storage backend. This project allows you to bypass standard Telegram bot limitations and upload files up to **2.0 GB** per file directly to a Telegram Private Channel.

## Features ✨

- **Unlimited Storage**: Leverages Telegram's free unlimited cloud storage.
- **Large File Uploads**: Upload files up to 2.0 GB, completely bypassing the standard 50 MB Telegram Bot API limit by using MTProto via GramJS.
- **Beautiful UI**: Built with Tailwind CSS v4 featuring a clean, responsive, and modern dashboard with Dark Mode and Light Mode support.
- **Image Previews**: Native inline preview for uploaded images.
- **Trash / Soft Delete**: Deleted files are moved to the Trash bin to prevent accidental data loss.
- **Recent Files**: Quickly find files you've uploaded or interacted with in the last 7 days.
- **Search functionality**: Instantly find files by name.
- **Telegram Sync**: Automatically pull and sync files that were manually uploaded directly inside your Telegram Channel.

## Tech Stack 🛠️

- **Framework**: Next.js 16 (App Router / Turbopack)
- **Styling**: Tailwind CSS v4
- **Database**: SQLite (via Prisma ORM v6)
- **Telegram Integration**: GramJS (MTProto)
- **Icons**: Lucide React
- **Theming**: Next-Themes

## Prerequisites 📝

Before you begin, you need to obtain your Telegram API credentials:
1. Log in to your Telegram account at [my.telegram.org](https://my.telegram.org)
2. Go to "API development tools" and create a new application to get your `API_ID` and `API_HASH`.
3. Create a **Private Channel** in Telegram to serve as your storage drive. Note down the Channel ID (usually starts with `-100`).

## Installation & Setup 🚀

1. **Clone the repository** (if applicable) and navigate to the project directory:
   ```bash
   cd TeleDrive
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env` file in the root directory and add the following:
   ```env
   DATABASE_URL="file:./dev.db"

   # Telegram API Credentials
   TELEGRAM_API_ID="YOUR_API_ID"
   TELEGRAM_API_HASH="YOUR_API_HASH"
   TELEGRAM_CHANNEL_ID="-100XXXXXXXXXX" # Must start with -100 for private channels

   # Session string generated from your account
   TELEGRAM_SESSION="YOUR_GENERATED_SESSION_STRING"
   ```

4. **Generate a Telegram Session String**:
   Since TeleDrive uses MTProto to upload large files, it acts as a "User Client" instead of a "Bot". You must generate a session string to authenticate.
   Run the session generator script:
   ```bash
   npx ts-node scripts/generate-session.ts
   ```
   Follow the prompts to enter your phone number and the OTP code sent to your Telegram app. Once successful, it will output a long session string. Copy it and paste it into `TELEGRAM_SESSION` in your `.env` file.

5. **Initialize Database**:
   Apply the Prisma schema to the SQLite database:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

6. **Start the Development Server**:
   ```bash
   npm run dev
   ```

7. **Open the App**:
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Security Warning ⚠️

TeleDrive currently has **no login or authentication system**. It is designed to run purely on your **local machine** for personal use. Do not deploy this application to a public server without first implementing a secure authentication layer (like NextAuth or Firebase Auth), otherwise anyone can access and delete your personal Telegram files.
