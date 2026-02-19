# Learnix Backend API ⚙️

The core backend for the **Learnix Skill Barter Matchmaking Platform**. This API handles user authentication, skill management, AI-powered matchmaking, real-time chat, and platform administration.

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- [Redis](https://redis.io/) (Optional for rate limiting)

### Installation
1. Navigate to the backend directory:
   ```bash
   cd learnix-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Configuration
1. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
2. Fill in your credentials:
   - `MONGODB_URI`: Your connection string.
   - `JWT_SECRET`: For authentication.
   - `CLOUDINARY_*`: (Optional) for profile picture uploads.
   - `SENDGRID_API_KEY`: (Optional) for email notifications.

---

## 🏗 Project Structure
- `controllers/`: Request handling logic and business rules.
- `models/`: Mongoose database schemas (User, Skill, Match, Request, Chat, Review, Report).
- `routes/`: API endpoint definitions versioned under `/api/v1`.
- `middleware/`: Authentication (JWT), Error handling, and safety guards (Helmet, Rate Limit).
- `socket/`: Real-time event handlers for chat, notifications, and typing status.
- `utils/`: Helper functions including the matching engine and logger.
- `scripts/`: Maintenance and administrative scripts.

---

## 🛠 Features

### 1. Authentication & Security
- Secure JWT-based authentication with refresh tokens.
- Password hashing with Bcrypt.
- Security headers using Helmet and CORS configuration.
- Rate limiting to prevent abuse.

### 2. Matchmaking Engine
- Advanced logic to connect users based on their "Teachable" and "Learnable" skills.
- Handles matching requests, approvals, and rejections.

### 3. Real-Time Communication
- Full-duplex chat powered by Socket.IO.
- Real-time typing indicators and read receipts.
- Instant notifications for match requests and new messages.

### 4. Admin System
- Dedicated dashboard endpoints for platform analytics.
- Moderation tools: User banning/unbanning and report management.
- Promote any user to admin via CLI:
  ```bash
  node scripts/makeAdmin.js email@example.com
  ```

---

## 🧪 Testing with Postman
A comprehensive Postman collection is provided for testing.
1. Import `tests/learnix-api-collection.json` into Postman.
2. Set `base_url` to `http://localhost:5001/api/v1`.
3. Authentication tokens are automatically stored in environment variables upon login.

---

## 📜 Available Scripts
- `npm start`: Run server in production mode.
- `npm run dev`: Run server with `nodemon` for development.
- `npm test`: Execute Jest tests with coverage reports.
