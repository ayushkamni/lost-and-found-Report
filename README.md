# lost-and-found-Report

[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 📖 Project Overview

**lost-and-found-Report** is a modern, premium‑styled web application that helps university campuses manage lost and found items efficiently. It provides a clean, responsive UI built with **React**, **Vite**, and **Firebase**, offering real‑time item reporting, search, and admin moderation.

## ✨ Key Features

- **Real‑time item reporting** – Users can quickly log lost or found items with photos.
- **Search & filter** – Powerful search by name, location, and date.
- **Admin dashboard** – Moderators can approve, delete, or mark items as returned.
- **Google authentication** – Secure sign‑in with Google accounts.
- **Responsive design** – Works beautifully on desktop, tablet, and mobile.
- **Premium UI** – Glassmorphism, smooth micro‑animations, and a curated color palette.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Front‑end | React 18, Vite, vanilla CSS (glassmorphism) |
| Auth & DB | Firebase Authentication, Firestore |
| Storage | Firebase Storage (for item photos) |
| CI/CD | GitHub Actions (optional) |

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or later)
- **Git**
- A **GitHub** account with a repository created for this project.

### Installation

```bash
# Clone the repository
git clone https://github.com/ayushkamni/lost-and-found-Report.git
cd lost-and-found-Report

# Install dependencies
npm install
```

### Firebase Configuration

1. Create a Firebase project at https://console.firebase.google.com.
2. Enable **Authentication** (Google provider) and **Firestore**.
3. Add a **Web app** and copy the Firebase config.
4. Create a `.env.local` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Running the Development Server

```bash
npm run dev
```

Open `http://localhost:5173` in your browser to see the app.

## 📦 Building for Production

```bash
npm run build
# Preview the production build
npm run preview
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes with clear messages.
4. Open a Pull Request describing the changes.

## 📄 License

This project is licensed under the **MIT License** – see the [LICENSE](LICENSE) file for details.

---

*Built with ❤️ by the lost‑and‑found team.*
