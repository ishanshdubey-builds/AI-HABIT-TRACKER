# AI Habit Tracker

An AI-powered habit tracking application built using the MERN stack and Google Gemini. It helps users build consistent routines, track daily habits, monitor streaks, visualize progress, and receive personalized AI-powered recommendations.

<p align="center">
  <strong>MERN Stack | React | Node.js | Express | MongoDB | Google Gemini</strong>
</p>

---

## About the Project

AI Habit Tracker is a full-stack web application designed to make habit tracking more organized and personalized.

Users can create and manage habits, record daily progress, monitor their consistency through streaks and visual analytics, and use AI-powered tools for personalized insights and recommendations.

The project combines traditional habit tracking with AI to help users understand their progress and develop better routines.

## Features

### Authentication
- User registration and login
- JWT-based authentication
- Password hashing using bcrypt
- Protected routes
- User profile management

### Habit Management
- Create, edit, and delete habits
- Archive and restore habits
- Organize habits by category
- Set habit frequency and weekly targets
- Customize habit colors and icons
- Reorder habits

### Daily Habit Tracking
- Mark habits as completed
- Undo completed habits
- Track daily progress
- View habit completion history
- Monitor daily completion percentages
- Visualize consistency using a 90-day heatmap

### Streak Tracking
- Track current streaks
- Monitor longest streaks
- View habit-specific statistics
- Identify broken streaks
- Get AI-assisted streak recovery plans

### Dashboard and Analytics
- View daily habit progress
- Monitor habit completion
- Analyze weekly performance
- View monthly activity
- Compare habit consistency
- Visualize progress using charts
- Explore category-wise statistics

### AI-Powered Features

**AI Weekly Report**
- Generate personalized weekly habit reports
- Review recent habit performance
- Identify areas for improvement
- Receive AI-generated feedback and encouragement

**AI Habit Suggestions**
- Get personalized habit recommendations
- Answer questions about personal goals and productivity
- Receive suggested habits with descriptions and categories
- Add recommended habits to your habit list

**AI Habit Analysis Chat**
- Interact with an AI assistant
- Ask questions about habit progress
- Receive personalized responses based on habit activity

**AI Streak Recovery Coach**
- Get personalized plans for recovering from broken streaks
- Receive practical suggestions for restarting habits
- Follow a structured recovery plan

**AI Morning Motivation**
- Generate personalized motivational messages
- Receive encouragement based on habit activity and progress

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Axios
- Recharts
- Lucide React
- React Icons
- React Markdown
- date-fns
- @dnd-kit
- canvas-confetti

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- bcryptjs
- dotenv
- CORS

### Artificial Intelligence
- Google Gemini API
- @google/genai

## Project Structure

```text
AI-HABIT-TRACKER/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── aiController.js
│   │   ├── authController.js
│   │   ├── habitController.js
│   │   └── logController.js
│   │
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   │
│   ├── models/
│   │   ├── AIInsight.js
│   │   ├── Habit.js
│   │   ├── HabitLog.js
│   │   └── User.js
│   │
│   ├── routes/
│   │   ├── ai.js
│   │   ├── auth.js
│   │   ├── habits.js
│   │   └── log.js
│   │
│   ├── utils/
│   │   ├── aiService.js
│   │   └── dateHelpers.js
│   │
│   ├── scripts/
│   ├── package.json
│   └── server.js
│
├── frontend/
│   └── ai-habit-tracker-ui-boilerplate-code/
│       ├── public/
│       ├── src/
│       │   ├── api/
│       │   ├── assets/
│       │   ├── components/
│       │   ├── context/
│       │   ├── pages/
│       │   └── utils/
│       │
│       ├── .env.example
│       ├── package.json
│       ├── index.html
│       └── vite.config.js
│
├── .gitignore
└── README.md
```

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- npm
- [MongoDB](https://www.mongodb.com/) or a MongoDB Atlas account
- [Google Gemini API key](https://aistudio.google.com/apikey) for AI features
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/ishanshdubey-builds/AI-HABIT-TRACKER.git
```

Navigate to the project directory:

```bash
cd AI-HABIT-TRACKER
```

### 2. Set Up the Backend

Navigate to the backend directory:

```bash
cd backend
```

Install the dependencies:

```bash
npm install
```

Create a `.env` file inside the `backend` directory.

Add the following environment variables:

```env
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=30d
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

Replace the placeholder values with your actual credentials.

**Important:** Never commit your `.env` file or expose your API keys and database credentials.

Start the backend development server:

```bash
npm run dev
```

The backend should be available at:

```text
http://localhost:8000
```

### 3. Set Up the Frontend

Open a new terminal from the project root.

Navigate to the frontend directory:

```bash
cd frontend/ai-habit-tracker-ui-boilerplate-code
```

Install the dependencies:

```bash
npm install
```

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8000/api
```

Start the frontend development server:

```bash
npm run dev
```

Vite will display the local development URL in the terminal. By default, it is:

```text
http://localhost:5173
```

Open this URL in your browser to access the application.

## Environment Variables

### Backend

| Variable | Description |
|---|---|
| `PORT` | Port on which the backend server runs |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign authentication tokens |
| `JWT_EXPIRES_IN` | JWT expiration duration |
| `CLIENT_URL` | Frontend origin allowed by CORS |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GEMINI_MODEL` | Gemini model used for AI features |

### Frontend

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API |

## API Overview

The backend provides REST API endpoints for authentication, habit management, habit logs, and AI-powered features.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Get the authenticated user |
| PUT | `/api/auth/profile` | Update user profile |

### Habits

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/habits` | Retrieve habits |
| POST | `/api/habits` | Create a habit |
| PUT | `/api/habits/:id` | Update a habit |
| DELETE | `/api/habits/:id` | Delete a habit |
| PUT | `/api/habits/:id/archive` | Archive or restore a habit |
| PUT | `/api/habits/reorder` | Reorder habits |

### Habit Logs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/logs` | Record habit completion |
| DELETE | `/api/logs` | Remove a completion record |
| GET | `/api/logs/today` | Retrieve today's logs |
| GET | `/api/logs/range` | Retrieve logs for a date range |
| GET | `/api/logs/heatmap` | Retrieve heatmap data |
| GET | `/api/logs/stats` | Retrieve overall statistics |
| GET | `/api/logs/stats/:habitId` | Retrieve habit-specific statistics |

### AI Features

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/ai/weekly-report` | Generate a weekly report |
| POST | `/api/ai/suggest-habits` | Generate habit suggestions |
| POST | `/api/ai/recovery-plan` | Generate a streak recovery plan |
| POST | `/api/ai/chat` | Chat with the AI assistant |
| GET | `/api/ai/morning` | Generate morning motivation |

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check backend health |

## Available Scripts

### Backend

Run these commands inside the `backend` directory.

| Command | Description |
|---|---|
| `npm run dev` | Start the development server using nodemon |
| `npm start` | Start the backend server |
| `npm run seed` | Run the database seed script |

### Frontend

Run these commands inside the frontend directory.

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the frontend for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Database Models

The application uses MongoDB and Mongoose to store user and habit data.

### User

Stores user information, authentication details, profile settings, and preferences.

### Habit

Stores habit details, including:

- Habit name and description
- Category
- Frequency and weekly target
- Color and icon
- Archive status
- Display order
- User reference

### HabitLog

Stores habit completion records, including:

- User reference
- Habit reference
- Completion date
- Optional notes

A unique index helps prevent duplicate completion records for the same user, habit, and date.

### AIInsight

Stores AI-generated insights and related metadata, including different insight types such as weekly reports, suggestions, recovery plans, chat, and morning motivation.

## Application Architecture

The application follows a client-server architecture.

```text
                 User
                   |
                   v
          React Frontend
                   |
                   | Axios / REST API
                   |
                   v
           Express Backend
                   |
          +--------+--------+
          |        |        |
          v        v        v
      MongoDB   JWT Auth   AI Service
                            |
                            v
                       Gemini API
                            |
                            v
                    AI-generated output
```

The React frontend communicates with the Express backend through REST API requests. The backend handles authentication, application logic, database operations, and requests to the Gemini API.

## Security

The application uses several security mechanisms:

- Password hashing with bcrypt
- JWT-based authentication
- Protected API routes
- User-specific data access
- Environment variables for sensitive configuration
- CORS configuration

For security, keep your API keys, database credentials, and JWT secrets private.

## Future Improvements

Potential improvements for future development include:

- Automated frontend and backend testing
- Password reset and email verification
- Habit reminders and notifications
- More detailed analytics
- Improved AI response validation and error handling
- Production deployment
- Continuous integration and deployment

## Author

**Ishansh Dubey**

- GitHub: [@ishanshdubey-builds](https://github.com/ishanshdubey-builds)

