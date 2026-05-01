const express = require("express");
const dotenv = require("dotenv");
const apiRoutes = require("./routes/api");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
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
});
