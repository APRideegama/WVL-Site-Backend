const mongoose = require("mongoose");

// Define the project schema
const projectSchema = new mongoose.Schema(
  {
    nationalId: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    project: {
      type: String,
      required: true,
      trim: true,
    },
    gsDivision: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    beforePhoto: {
      data: Buffer, // Store the image binary data
      contentType: String, // Store the MIME type
    },
    afterPhoto: {
      data: Buffer,
      contentType: String,
    },
    lat: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },
    lng: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// Create models for each collection
const CESP = mongoose.model("CESP", projectSchema, "CESP");
const CP = mongoose.model("CP", projectSchema, "CP");
const LED = mongoose.model("LED", projectSchema, "LED");
const IN = mongoose.model("IN", projectSchema, "IN");

// Export models
module.exports = { CESP, CP, LED, IN };
