# Learnix: Skill Barter Matchmaking Platform 🚀

Learnix is a modern, full-stack platform designed to facilitate skill exchange through an AI-powered matchmaking system. It allows users to trade their expertise (e.g., coding, design, language) with others, fostering a collaborative learning community.

## 📖 Table of Contents
- [Project Overview](#-project-overview)
- [Project Structure](#-project-structure)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [License](#-license)

---

## 🌟 Project Overview
In a world where specialized knowledge is valuable, Learnix bridges the gap between those who want to learn and those who can teach. Instead of monetary transactions, users barter skills, creating a mutual growth environment.

---

## 🏗 Project Structure
The repository is split into two main components:

- **[learnix-backend](./learnix-backend/)**: Node.js/Express API with MongoDB, handling authentication, matchmaking logic, and real-time communication.
- **[learnix-frontend](./learnix-frontend/)**: React-based dashboard and interface for a seamless user experience.

---

## ✨ Key Features
- **AI-Powered Matchmaking**: Intelligent algorithms to find the perfect skill partners based on interests and expertise.
- **Real-Time Communication**: Integrated chat with Socket.IO for seamless collaboration and coordination.
- **Trust & Reviews**: A robust review and trust system to ensure a high-quality community.
- **Skill Management**: Easy-to-use interface for listing and discovering skills.
- **Admin Dashboard**: Comprehensive moderation and analytics tools for platform management.

---

## 🛠 Tech Stack

### Backend
- **Core**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **Real-time**: Socket.IO
- **Security**: JWT, Helmet, Express-Rate-Limit, Bcrypt.js
- **Utilities**: Winston (Logging), Morgan (HTTP logging), Multer (File uploads), Cloudinary (Image storage)

### Frontend
- **Framework**: React.js
- **Styling**: Tailwind CSS, Headless UI
- **Routing**: React Router DOM
- **Icons**: Heroicons
- **API Communication**: Axios
- **Real-time**: Socket.IO Client

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v16+)
- MongoDB (Running locally or on Atlas)
- npm or yarn

### 2. Setup

#### Backend
```bash
cd learnix-backend
npm install
# Configure your .env (see learnix-backend/.env.example)
npm run dev
```

#### Frontend
```bash
cd learnix-frontend
npm install
npm start
```

For detailed instructions, please refer to the individual `README.md` files in the [backend](./learnix-backend/README.md) and [frontend](./learnix-frontend/README.md) directories.

---

## 🛡 License
Distributed under the MIT License.

---

*Elevate your skills by teaching others. Welcome to Learnix.*
