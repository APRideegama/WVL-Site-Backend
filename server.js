const express = require("express");
const cors = require("cors");
require("dotenv").config(); // Load environment variables from .env file

const connectDB = require("./config/db");
const projectRoutes = require("./routes/projectRoutes");
const galleryRoutes = require("./routes/galleryRoutes");

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // For parsing JSON data
app.use(express.urlencoded({ extended: true })); // For parsing URL-encoded data

// Connect to MongoDB
connectDB();

// Routes
app.use("/api", projectRoutes); // All project-related routes prefixed with '/api'
app.get("/emailjs-config", (req, res) => {
  // Send EmailJS configuration to the frontend
  res.json({
    serviceId: process.env.EMAILJS_SERVICE_ID,
    templateId: process.env.EMAILJS_TEMPLATE_ID,
    publicKey: process.env.EMAILJS_PUBLIC_KEY,
  });
});
app.use("/gallery", galleryRoutes); // All gallery routes prefixed with '/gallery'

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
