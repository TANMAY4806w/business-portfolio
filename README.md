# 🏢 Business Portfolio

A full-stack web application built with **Firebase, Express, React, and Node.js** where **businesses** create digital portfolios and **clients** can browse, hire, chat, and review them.

![Home Page](https://img.shields.io/badge/status-production--ready-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue) ![Node](https://img.shields.io/badge/node-18%2B-green) ![Firebase](https://img.shields.io/badge/database-Firebase-FFCA28)

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Local Setup Guide](#-local-setup-guide)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [User Roles & Permissions](#-user-roles--permissions)
- [Socket.io Events](#-socketio-events)
- [Database Schema](#-database-schema)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **JWT Authentication** | Register/login with bcrypt password hashing, role-based access control |
| 👔 **Business Profiles** | Company name, description, industry, logo, portfolio projects |
| 🛒 **Service Marketplace** | Full CRUD, keyword search, industry/price/rating filters |
| 📋 **Hire Requests** | Create → Accept/Reject → Complete workflow with status tracking |
| 💬 **Real-Time Chat** | Socket.io rooms per hire request, typing indicators, persistent messages |
| ⭐ **Reviews & Ratings** | Post-completion reviews with auto-calculated average ratings |
| 🔍 **Smart Search** | Full-text search + multi-filter across services and businesses |
| 🔔 **Toast Notifications** | Animated success/error/warning/info notifications |
| 📱 **Responsive Design** | Works on desktop, tablet, and mobile |

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **Firebase Admin SDK** | Database (Firestore) & Auth Verification |
| **Firebase Services** | Auth, Firestore, Mail Extension |
| **Socket.io** | Real-time WebSocket communication |
| **cors** | Cross-origin resource sharing |
| **dotenv** | Environment variable management |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | UI library |
| **Vite** | Build tool & dev server |
| **Tailwind CSS** | Utility-first CSS framework |
| **React Router v6** | Client-side routing |
| **Axios** | HTTP client |
| **Socket.io Client** | WebSocket client |
| **Context API** | State management (Auth) |

---

## 📁 Project Structure

```
Business Portfolio/
├── backend/
│   ├── config/
│   │   └── firebase.js           # Firebase Admin config
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, GetMe
│   │   ├── businessController.js # Profile CRUD, portfolio projects
│   │   ├── serviceController.js  # Service CRUD, search, filters
│   │   ├── hireController.js     # Hire request lifecycle
│   │   ├── messageController.js  # Chat message retrieval
│   │   └── reviewController.js   # Review creation & retrieval
│   ├── middleware/
│   │   └── auth.js               # JWT verify + role authorization
│   ├── models/
│   │   ├── User.js               # User schema (name, email, password, role)
│   │   ├── BusinessProfile.js    # Business profile with portfolio
│   │   ├── Service.js            # Services with text index
│   │   ├── HireRequest.js        # Hire request with status tracking
│   │   ├── Message.js            # Chat messages
│   │   └── Review.js             # Reviews with auto-rating calc
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── businessRoutes.js
│   │   ├── serviceRoutes.js
│   │   ├── hireRoutes.js
│   │   ├── messageRoutes.js
│   │   └── reviewRoutes.js
│   ├── .env.example              # Environment variable template
│   ├── package.json
│   └── server.js                 # Express + Socket.io entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation bar with auth status
│   │   │   ├── Footer.jsx        # Site footer
│   │   │   ├── ProtectedRoute.jsx# Auth + role guard
│   │   │   ├── Sidebar.jsx       # Dashboard sidebar nav
│   │   │   ├── ServiceCard.jsx   # Service display card
│   │   │   ├── ReviewCard.jsx    # Review display card
│   │   │   ├── StarRating.jsx    # Interactive star rating
│   │   │   ├── SearchFilters.jsx # Marketplace filters
│   │   │   └── Toast.jsx         # Toast notification system
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Authentication state management
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Landing + marketplace
│   │   │   ├── Login.jsx         # Login form
│   │   │   ├── Register.jsx      # Register with validation
│   │   │   ├── BusinessDashboard.jsx # Dashboard layout
│   │   │   ├── ManageProfile.jsx # Profile editor
│   │   │   ├── ManageServices.jsx# Service list management
│   │   │   ├── AddService.jsx    # Add new service form
│   │   │   ├── BusinessProfilePublic.jsx # Public business profile
│   │   │   ├── HireRequests.jsx  # Hire request management
│   │   │   ├── Chat.jsx          # Real-time chat
│   │   │   └── NotFound.jsx      # 404 page
│   │   ├── services/
│   │   │   └── api.js            # Axios instance + API functions
│   │   ├── App.jsx               # Route definitions
│   │   ├── main.jsx              # Entry point
│   │   └── index.css             # Global styles + Tailwind
│   ├── index.html
│   ├── vite.config.js            # Vite config with API proxy
│   ├── tailwind.config.js        # Tailwind dark theme config
│   ├── postcss.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## ✅ Prerequisites

- **Node.js** 18+ → [Download](https://nodejs.org/)
- **Firebase Project** (Free Tier):
  - Requires a Firebase account and project setup at [console.firebase.google.com](https://console.firebase.google.com)
- **Git** → [Download](https://git-scm.com/)

---

## 🚀 Local Setup Guide

### 1. Clone the repository

```bash
git clone https://github.com/TANMAY4806w/business-portfolio.git
cd business-portfolio
```

### 2. Setup & Environment

**Backend:**
```bash
cd backend
# Copy environment template
cp .env.example .env
# Important: Ensure you add your Firebase Service Account JSON as instructed in the guide!
```

### 3. Running the App (1st Time Only - Installation)

You must install all Node modules the very first time you clone the repository.

**Terminal 1 (Backend):**
```bash
cd backend
npm install
npm start
```
*The backend runs on **http://localhost:5000***

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```
*The frontend runs on **http://localhost:5173***

### 4. Running the App (2nd Time & Subsequent Runs)

If you have already installed the dependencies previously, you just need to start your development servers:

**Terminal 1 (Backend):**
```bash
cd backend
npm start
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### 5. No Third-Party Webhooks Needed!

You do **not** need to install Stripe or run any webhook listeners. The platform comes with a built-in **Simulated Payment Gateway** that natively simulates bank authorization delays, updates the database, and generates/emails PDF Invoices directly from the Node.js backend.

### 6. Open the app

Go to **http://localhost:5173** in your browser. 🎉

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
CLIENT_URL=http://localhost:5173

# Firebase Production Keys
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# Email Configuration
EMAIL_USER=your_platform_email@gmail.com
EMAIL_PASS=your_app_password
```

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Server port (default: 5000) |
| `FIREBASE_*` | Yes | Firebase Admin SDK credentials |
| `EMAIL_*` | Yes | Nodemailer credentials for sending invoices |
| `CLIENT_URL` | No | Frontend URL for CORS (auto-includes localhost) |

### Frontend Environment (Required for Firebase)

Create a `.env` file in the `frontend/` directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Firebase Setup (Cloud — Free)

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a project.
2. Enable **Firestore Database** (in Test Mode).
3. Enable **Authentication** (Email/Password).
4. Go to **Project Settings → Service Accounts** and generate a new private key.
5. Use the JSON file to populate your `backend/.env`.
6. Go to **Project Settings → General**, add a Web App, and use the config to populate your `frontend/.env`.

---

## 📡 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Register new user |
| `POST` | `/api/auth/login` | ❌ | Login and get JWT |
| `GET` | `/api/auth/me` | ✅ | Get current user |

**Register body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456",
  "role": "client"  // or "business"
}
```

### Business Profiles (`/api/business`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `POST` | `/api/business/profile` | ✅ | Business | Create/update profile |
| `GET` | `/api/business/profile/me/data` | ✅ | Business | Get own profile |
| `GET` | `/api/business/profile/:userId` | ❌ | Any | Get public profile |
| `GET` | `/api/business/profiles` | ❌ | Any | List all profiles |
| `POST` | `/api/business/profile/project` | ✅ | Business | Add portfolio project |
| `DELETE` | `/api/business/profile/project/:id` | ✅ | Business | Remove portfolio project |

### Services (`/api/services`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| `GET` | `/api/services` | ❌ | Any | List/search services |
| `GET` | `/api/services/:id` | ❌ | Any | Get single service |
| `GET` | `/api/services/mine` | ✅ | Business | Get my services |
| `GET` | `/api/services/business/:id` | ❌ | Any | Get services by business |
| `POST` | `/api/services` | ✅ | Business | Create service |
| `PUT` | `/api/services/:id` | ✅ | Business | Update service |
| `DELETE` | `/api/services/:id` | ✅ | Business | Delete service |

**Search query params:** `?keyword=web&industry=Technology&minPrice=100&maxPrice=1000&minRating=4`

### Hire Requests (`/api/hire`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/hire` | ✅ | Create hire request |
| `GET` | `/api/hire` | ✅ | Get my hire requests (filtered by role) |
| `GET` | `/api/hire/:id` | ✅ | Get single hire request |
| `PUT` | `/api/hire/:id` | ✅ | Update status (accept/reject/complete) |

**Hire request statuses:** `pending` → `accepted` → `completed` (or `rejected`)

### Messages (`/api/messages`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/messages/:hireRequestId` | ✅ | Get chat history |

### Reviews (`/api/reviews`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/reviews` | ✅ | Create review (clients only, hire must be completed) |
| `GET` | `/api/reviews/:businessId` | ❌ | Get reviews for a business |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health status |

---

## 👥 User Roles & Permissions

| Action | Client | Business |
|--------|--------|----------|
| Browse marketplace | ✅ | ✅ |
| View business profiles | ✅ | ✅ |
| Create hire request | ✅ | ❌ |
| Accept/reject hire | ❌ | ✅ |
| Mark hire completed | ❌ | ✅ |
| Chat (on accepted hires) | ✅ | ✅ |
| Leave reviews | ✅ | ❌ |
| Create services | ❌ | ✅ |
| Manage profile | ❌ | ✅ |

---

## 🔌 Socket.io Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `joinRoom` | `{ hireRequestId, userId }` | Join a chat room |
| `sendMessage` | `{ hireRequestId, senderId, receiverId, text }` | Send a message |
| `typing` | `{ hireRequestId, userId, name }` | Start typing indicator |
| `stopTyping` | `{ hireRequestId }` | Stop typing indicator |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `newMessage` | `Message object` | New message received |
| `userTyping` | `{ userId, name }` | Other user is typing |
| `userStopTyping` | `{}` | Other user stopped typing |
| `error` | `{ message }` | Error message |

---

## 🗄 Database Schema

### User
```
name     : String (required)
email    : String (required, unique)
password : String (hashed with bcrypt)
role     : "client" | "business"
```

### BusinessProfile
```
userId           : ObjectId → User
companyName      : String
description      : String
industry         : String
logo             : String (URL)
portfolioProjects: [{ title, description, imageUrl }]
averageRating    : Number (auto-calculated)
totalReviews     : Number (auto-calculated)
```

### Service
```
businessId   : ObjectId → User
title        : String (text-indexed)
description  : String (text-indexed)
price        : Number
deliveryTime : String
```

### HireRequest
```
clientId   : ObjectId → User
businessId : ObjectId → User
serviceId  : ObjectId → Service
status     : "pending" | "accepted" | "rejected" | "completed"
```

### Message
```
senderId      : ObjectId → User
receiverId    : ObjectId → User
hireRequestId : ObjectId → HireRequest
text          : String
```

### Review
```
businessId    : ObjectId → User
clientId      : ObjectId → User
hireRequestId : ObjectId → HireRequest
rating        : Number (1–5)
reviewText    : String
```

---

## 🚀 Deployment

### Backend → Render.com (Free)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Add environment variables: `PORT`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
6. Deploy

### Frontend → Vercel (Free)

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Settings:
   - **Root Directory:** `frontend`
   - **Framework:** Vite
4. Add environment variables: `VITE_API_URL`, `VITE_SOCKET_URL`
5. Deploy

> **Important:** After deploying frontend, set `CLIENT_URL` on Render to your Vercel URL.

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| `Firebase app/invalid-credential` | Ensure your `FIREBASE_PRIVATE_KEY` is fully copied into `.env` exactly with the quotes and newlines. |
| `CORS error` | Make sure `CLIENT_URL` matches your frontend URL exactly |
| `Socket.io not connecting` | Check frontend `VITE_SOCKET_URL` matches backend URL |
| `npm install` fails | Delete `node_modules` and `package-lock.json`, then run `npm install` again |
| `Port already in use` | Kill the process on that port or change `PORT` in `.env` |

---

## 🤝 Contributing

1. Fork the repo
2. Create a new branch: `git checkout -b feature/your-feature`
3. Make your changes and commit: `git commit -m "Add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
