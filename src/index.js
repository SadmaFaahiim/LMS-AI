const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const apiRoutes = require("./routes/api");
const scheduler = require("./scheduler");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests from:
    // 1. Frontend dev server (http://localhost:5173)
    // 2. RAG API service (https://localhost:7001)
    // 3. Production frontend (from environment variable)
    // 4. No origin (same-origin requests, Postman, curl, etc.)

    const allowedOrigins = [
      "http://localhost:5173", // Vite dev server
      "https://localhost:7001", // RAG API (fixed URL)
      "http://localhost:7001",
      "http://localhost:5000", // RAG API (HTTP variant)
      process.env.FRONTEND_URL, // Production frontend
    ].filter(Boolean); // Remove undefined values

    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    // In development, allow all origins
    if (process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }

    // In production, check against whitelist
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Enable cookies/auth headers
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options("*", cors(corsOptions));

// Standard middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", apiRoutes);

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Express Prisma API" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Something went wrong!",
    error: err.message || "Something went wrong!",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  // Initialize scheduler after server starts
  try {
    scheduler.initialize();
  } catch (error) {
    console.error('Failed to initialize scheduler:', error.message);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  scheduler.shutdown();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  scheduler.shutdown();
  process.exit(0);
});
