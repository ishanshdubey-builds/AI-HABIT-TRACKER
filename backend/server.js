import "dotenv/config";
import express from "express";
import cors from "cors";

import { connectDB } from "./config/db.js";

import authRoutes from "./routes/auth.js";
import habitRoutes from "./routes/habits.js";
import logRoutes from "./routes/log.js";
import aiRoutes from "./routes/ai.js";
import researchRoutes from "./routes/researchRoutes.js";

import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

// ========================================
// CORS CONFIGURATION
// ========================================

const allowedOrigins = (process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const corsOptions = {
    origin(origin, callback) {
        // Allow requests without an Origin header,
        // such as curl and server-to-server requests.
        if (!origin) {
            return callback(null, true);
        }

        // Allow localhost and 127.0.0.1 during development.
        const isLocalhost =
            /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

        if (isLocalhost) {
            return callback(null, true);
        }

        // Allow origins explicitly configured in CLIENT_URL.
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization"],
};

// ========================================
// MIDDLEWARE
// ========================================

app.use(cors(corsOptions));

app.use(express.json({ limit: "1mb" }));

// ========================================
// ROOT ROUTE
// ========================================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "AI Habit Tracker API is running!",
    });
});

// ========================================
// HEALTH CHECK ROUTE
// ========================================

app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        time: new Date().toISOString(),
    });
});

// ========================================
// API ROUTES
// ========================================

app.use("/api/auth", authRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/research", researchRoutes);

// ========================================
// ERROR-HANDLING MIDDLEWARE
// Keep these at the end.
// ========================================

app.use(notFound);
app.use(errorHandler);

// ========================================
// START SERVER AFTER DATABASE CONNECTS
// ========================================

const PORT = process.env.PORT || 8000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    });