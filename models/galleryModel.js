const mongoose = require("mongoose");

// Define the gallery schema
const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true, // Title is mandatory
      trim: true, // Removes whitespace from both ends
    },
    description: {
      type: String,
      required: false, // Optional description
      trim: true,
    },
    image: {
      data: Buffer, // Store binary data
      contentType: String, // Store MIME type
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create the model
const Gallery = mongoose.model("Gallery", gallerySchema);

module.exports = Gallery;
