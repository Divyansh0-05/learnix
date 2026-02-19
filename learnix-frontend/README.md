# Learnix Frontend 🎨

The interactive UI for the **Learnix Skill Barter Matchmaking Platform**, built with React and Tailwind CSS.

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [Learnix Backend](https://github.com/Divyansh0-05/ToneNTrend/tree/main/learnix-backend) (Must be running for full functionality)

### Installation
1. Navigate to the frontend directory:
   ```bash
   cd learnix-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Configuration
Create a `.env` file in the `learnix-frontend` directory:
```env
REACT_APP_API_URL=http://localhost:5001/api/v1
REACT_APP_SOCKET_URL=http://localhost:5001
```

---

## 🏗 Project Structure
- `src/components/`: Reusable UI elements (Navbar, Modals, Cards).
- `src/pages/`: Main application views (Dashboard, Login, Profile, Discover).
- `src/context/`: State management for Authentication and UI settings.
- `src/services/`: API communication layer using Axios.
- `src/utils/`: Formatting helpers and shared constants.
- `src/socket/`: Frontend Socket.IO integration for real-time features.

---

## ✨ Features

### 📊 Dashboard
- Overview of your active matches and incoming requests.
- Quick stats on your skill barter activity.

### 🔍 Discovery
- Search and filter for users with skills you want to learn.
- Intelligent recommendations based on your expertise.

### 💬 Real-Time Chat
- Seamless messaging interface for coordination with barter partners.
- Live typing status and instant notifications.

### 🛡 Admin Dashboard
- Specialized interface for platform moderators.
- Manage user reports, ban/unban users, and view platform analytics.

---

## 📜 Available Scripts
- `npm start`: Runs the app in development mode.
- `npm run build`: Builds the app for production to the `build` folder.
- `npm test`: Launches the test runner.
