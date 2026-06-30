<div align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" alt="TeleDrive Logo" width="120" />
  <br/>
  <h1>TeleDrive ☁️</h1>
  <p><strong>Your Personal Unlimited Cloud Storage, Powered by Telegram.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite" alt="SQLite" />
  </p>
</div>

<br/>

TeleDrive is a modern, personal cloud storage web application built to mimic the beautiful experience of Google Drive, but utilizing **Telegram** as the underlying unlimited storage backend. By leveraging the Telegram MTProto API via GramJS, TeleDrive bypasses standard Bot limitations, allowing you to upload and manage files up to **2.0 GB** per file effortlessly!

## ✨ Key Features

*   ♾️ **Unlimited Storage**: Say goodbye to "Storage Full" notifications. Utilize Telegram's free, unlimited cloud infrastructure.
*   🚀 **Large File Uploads**: Upload massive files up to 2.0 GB, completely bypassing the standard 50 MB Telegram Bot API limit.
*   📁 **Global Drag & Drop**: Seamlessly drag and drop files anywhere on the screen. Powered by `tus-js-client` for resumable, chunked background uploads.
*   🔒 **Secure Admin Authentication**: Fully protected dashboard powered by **NextAuth**. Your files are safe; only authorized users can access the drive.
*   🌐 **In-App Session Generator**: No more struggling with terminal scripts! Generate and manage your Telegram session directly from the beautiful web UI.
*   🎨 **Premium Glassmorphism UI**: A stunning public Landing Page and a premium dashboard heavily inspired by modern glassmorphism design trends.
*   🗑️ **Smart Trash System**: Deleted files are safely moved to the Trash bin (with automatic 30-day cleanup) to prevent accidental data loss.
*   🖼️ **File Previews**: Native inline preview for your uploaded images, videos, and documents through a beautiful modal dialog.
*   🔄 **Real-Time UI**: Instant UI updates across components powered by **SWR** and **Zustand** state management.
*   ⭐ **Starred Files & Folders**: Pin your most important files for quick access via a dedicated Starred menu.
*   📊 **Storage Analytics**: Dynamic UI showcasing your unlimited capability in the dashboard (e.g., "1.4 GB / ∞ Unlimited").
*   🔗 **Shareable Public Links**: Generate and share public links allowing anyone to download files securely without logging in.
*   🎬 **In-App Streaming**: Play video and audio files smoothly directly in your browser using HTTP Range Requests (206) piped straight from Telegram.
*   🧹 **Smart Auto-Cleanup (Lazy Cron)**: Trashed files older than 30 days are automatically detected and permanently revoked from Telegram.
*   🔍 **Advanced Search**: Find your files instantly with powerful, format-aware (mimeType) filtering capabilities.

## 🛠️ Technology Stack

*   **Core**: Next.js 15 (App Router), React 19, TypeScript
*   **State & Data Fetching**: Zustand (State Management), SWR (Data Fetching)
*   **Styling**: Tailwind CSS v4, Lucide React Icons
*   **Database**: Prisma ORM with SQLite
*   **Authentication**: NextAuth.js (Credentials Provider)
*   **Telegram Client**: GramJS (MTProto)

## 📋 Prerequisites

Before you begin, you need to obtain your Telegram API credentials:

1.  Log in to your Telegram account at [my.telegram.org](https://my.telegram.org)
2.  Go to **API development tools** and create a new application to get your `API_ID` and `API_HASH`.
3.  Create a **Private Channel** in Telegram to serve as your storage drive. Note down the Channel ID (usually starts with `-100`).

## 🚀 Installation & Setup

**1. Clone the repository**
```bash
git clone https://github.com/yourusername/teledrive.git
cd teledrive
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up Environment Variables**
Create a `.env` file in the root directory and configure your credentials:

```env
# Database
DATABASE_URL="file:./dev.db"

# Admin Authentication (Change these!)
ADMIN_EMAIL="admin@teledrive.com"
ADMIN_PASSWORD="password123"
NEXTAUTH_SECRET="your-super-secret-key-32-chars-long"

# Telegram API Credentials
TELEGRAM_API_ID="YOUR_API_ID"
TELEGRAM_API_HASH="YOUR_API_HASH"
TELEGRAM_CHANNEL_ID="-100XXXXXXXXXX" # Must start with -100
```

**4. Initialize the Database**
Apply the Prisma schema to create your local SQLite database:
```bash
npx prisma db push
```

**5. Start the Application**
```bash
npm run dev
```

**6. Log In and Connect Telegram**
*   Visit `http://localhost:3000` in your browser.
*   Log in using the `ADMIN_EMAIL` and `ADMIN_PASSWORD` you set in the `.env` file.
*   Once logged in, go to the **Settings** page via the top-right profile menu.
*   Use the **"Buat Sesi Baru Otomatis"** (Automatic Session Generator) to log in to your Telegram account directly from the website!

## 🔐 Privacy & Security

TeleDrive is a **Self-Hosted** application.
*   **No Third-Party Servers**: Your data is not routed through or stored on any third-party servers other than Telegram's official infrastructure.
*   **Local Storage**: Your Telegram Session string and file metadata are stored securely in your local SQLite database.
*   **Private Channels**: Files are uploaded to your specified private Telegram channel, meaning nobody else can access them unless they have access to your Telegram account.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.
