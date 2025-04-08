const mongoose = require("mongoose");

const connectDB = async () => {
  console.log("Initializing MongoDB connection...");
  try {
    await mongoose.connect(process.env.MONGO_URI); // Removed deprecated options
    console.log("Successfully connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1); // Exit the process with failure if connection fails
  }
};

module.exports = connectDB;
