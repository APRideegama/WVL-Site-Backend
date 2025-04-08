const Gallery = require("../models/galleryModel");
const multer = require("multer");
const fs = require("fs");
const sharp = require("sharp");

// ------------------------ Multer Configuration ------------------------

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `image-${uniqueSuffix}.jpeg`);
  },
});

const upload = multer({ storage });

// ------------------------ Helper Functions ------------------------

/**
 * Compresses an image file using Sharp and returns the buffer.
 * @param {string} filePath - Path to the image file.
 * @returns {Promise<{ data: Buffer, contentType: string } | null>}
 */
const compressImage = async (filePath) => {
  try {
    const compressedBuffer = await sharp(filePath)
      .resize({ width: 800 }) // Resize width to 800px (maintains aspect ratio)
      .jpeg({ quality: 70 }) // Compress to 70% quality JPEG
      .toBuffer();

    return { data: compressedBuffer, contentType: "image/jpeg" };
  } catch (err) {
    console.error(`Error compressing image: ${filePath}`, err);
    return null;
  }
};

/**
 * Cleans up temporary files after processing uploads.
 * @param {string} filePath - Path of the file to delete.
 */
const cleanUpFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted temporary file: ${filePath}`);
    }
  } catch (err) {
    console.error(`Error deleting file ${filePath}:`, err);
  }
};

// ------------------------ Controller Functions ------------------------

/**
 * Retrieves all items from the gallery and formats photo fields.
 */
const getAllItems = async (req, res) => {
  try {
    const items = await Gallery.find();
    const formattedItems = items.map((item) => ({
      ...item._doc,
      image:
        item.image && item.image.data
          ? `data:${item.image.contentType};base64,${item.image.data.toString(
              "base64"
            )}`
          : null,
    }));
    res.json(formattedItems);
  } catch (error) {
    console.error("Error fetching gallery items:", error);
    res.status(500).json({ message: "Error fetching gallery items" });
  }
};

/**
 * Creates a new gallery item with an image upload.
 */
const createItem = async (req, res) => {
  try {
    const { title, description } = req.body;

    // 🛠 Ensure image file is uploaded
    if (!req.file) {
      return res.status(400).json({ message: "Image is required!" });
    }

    // Compress uploaded image
    const image = await compressImage(req.file.path);
    if (!image) {
      cleanUpFile(req.file.path);
      return res.status(500).json({ message: "Failed to process image" });
    }

    // Create new gallery item
    const newItem = new Gallery({
      title,
      description,
      image,
    });

    const savedItem = await newItem.save();

    // Cleanup temporary files
    cleanUpFile(req.file.path);

    res.status(201).json(savedItem);
  } catch (err) {
    console.error("Error creating gallery item:", err);
    res.status(500).json({ message: "Error creating gallery item" });
  }
};

/**
 * Retrieves a single gallery item by its ID.
 */
const getItemById = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ message: "Item not found" });
    }
  } catch (error) {
    console.error("Error fetching item by ID:", error);
    res.status(500).json({ message: "Error fetching gallery item" });
  }
};

/**
 * Updates an existing gallery item by ID.
 */
const updateItem = async (req, res) => {
  try {
    const { title, description } = req.body;

    const item = await Gallery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.title = title || item.title;
    item.description = description || item.description;

    if (req.file) {
      // Compress and save the new image
      const image = await compressImage(req.file.path);
      if (image) {
        item.image = image;
        cleanUpFile(req.file.path);
      }
    }

    await item.save();
    res.json(item);
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ message: "Error updating gallery item" });
  }
};

/**
 * Deletes a gallery item by ID.
 */
const deleteItem = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    await item.deleteOne();
    res.json({ message: "Item removed" });
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ message: "Error deleting gallery item" });
  }
};

module.exports = {
  upload, // Export multer upload middleware
  createItem,
  getAllItems,
  getItemById,
  deleteItem,
  updateItem,
};
