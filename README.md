# Learnix: Skill Barter Matchmaking Platform

Learnix is a modern, full-stack web application designed to connect people who want to share their skills through a barter system. Users can list what they can teach and what they want to learn, and the platform helps find the perfect match.

## 🚀 Features

- **Matchmaking Engine**: Finds users with complementary skills based on what you offer and what you want to learn.
- **Real-time Chat**: Connect with your matches instantly using Socket.IO.
- **Modern UI**: A sleek, dark-themed interface built with React and Tailwind CSS.
- **Admin Dashboard**: Comprehensive tools for managing users, reports, and platform statistics.
- **Profile Management**: Customize your skills, bio, and location.

## 🛠 Tech Stack

### Backend
- **Node.js & Express**: Core server and API.
- **MongoDB & Mongoose**: Database and object modeling.
- **Socket.IO**: Real-time communication.
- **JWT**: Secure authentication and session management.
- **Redis**: (Optional) For high-performance caching.
- **Cloudinary**: For user avatar storage.

### Frontend
- **React**: Modern component-based UI.
- **Tailwind CSS**: Utility-first styling for a premium look.
- **React Router**: Seamless navigation.
- **Axios**: API communication with automatic token refresh.
- **React Hot Toast**: Beautiful notifications.

## 📦 Project Structure

```text
learnix/
├── learnix-backend/    # Node.js server
└── learnix-frontend/   # React application
```

## 🔧 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Divyansh0-05/learnix.git
   cd learnix
   ```

2. **Backend Setup**:
   ```bash
   cd learnix-backend
   npm install
   # Create a .env file based on .env.example
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd ../learnix-frontend
   npm install
   # Create a .env file based on .env.example
   npm start
   ```

## 🌐 Deployment

The application is configured for deployment on **Render**.
---
Built with ❤️ by the Learnix Team.
