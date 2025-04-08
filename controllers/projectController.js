const { CESP, CP, LED, IN } = require("../models/projectModel");
const multer = require("multer");
const fs = require("fs");
const sharp = require("sharp");

// ------------------------ Multer Configuration ------------------------

const upload = multer({ dest: "uploads/" }); // Temporary folder for file uploads

// ------------------------ Helper Functions ------------------------

/**
 * Maps tab names to their respective Mongoose models.
 * @param {string} tab - Tab name (e.g., 'cesp', 'cp').
 * @returns {Mongoose.Model | null} The corresponding model or null if invalid.
 */
const getModelByTab = (tab) => {
  switch (tab) {
    case "cesp":
      return CESP;
    case "cp":
      return CP;
    case "led":
      return LED;
    case "in":
      return IN;
    default:
      return null;
  }
};

/**
 * Compresses an image file using Sharp and returns the buffer.
 * @param {string} filePath - Path to the image file.
 * @returns {Promise<{ data: Buffer, contentType: string } | null>}
 */
const compressImage = async (filePath) => {
  try {
    const compressedBuffer = await sharp(filePath)
      .resize({ width: 800 }) // Resize width to 800px
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
 * @param {Object} files - Files object from Multer.
 */
const cleanUpTemporaryFiles = (files) => {
  try {
    if (files.beforePhoto) {
      fs.unlinkSync(files.beforePhoto[0].path);
      console.log("Temporary before photo file cleaned up.");
    }
    if (files.afterPhoto) {
      fs.unlinkSync(files.afterPhoto[0].path);
      console.log("Temporary after photo file cleaned up.");
    }
  } catch (err) {
    console.error("Error cleaning up temporary files:", err);
  }
};

// ------------------------ Controller Functions ------------------------

/**
 * Fetches all items from a specified collection.
 */
const getAllItems = async (req, res) => {
  const { tab } = req.params;
  const model = getModelByTab(tab);

  if (!model) {
    return res.status(400).json({ message: "Invalid collection/tab" });
  }

  try {
    const items = await model.find();
    const formattedItems = items.map((item) => ({
      ...item._doc,
      beforePhoto:
        item.beforePhoto && item.beforePhoto.data
          ? `data:${
              item.beforePhoto.contentType
            };base64,${item.beforePhoto.data.toString("base64")}`
          : null,
      afterPhoto:
        item.afterPhoto && item.afterPhoto.data
          ? `data:${
              item.afterPhoto.contentType
            };base64,${item.afterPhoto.data.toString("base64")}`
          : null,
    }));
    res.json(formattedItems);
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ message: "Error fetching items" });
  }
};

/**
 * Fetches a single item by ID from a specified collection.
 */
const getItemById = async (req, res) => {
  const { tab, id } = req.params;
  const model = getModelByTab(tab);

  if (!model) {
    return res.status(400).json({ message: "Invalid collection/tab" });
  }

  try {
    const item = await model.findById(id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    const formattedItem = {
      ...item._doc,
      beforePhoto: item.beforePhoto
        ? `data:${
            item.beforePhoto.contentType
          };base64,${item.beforePhoto.data.toString("base64")}`
        : null,
      afterPhoto: item.afterPhoto
        ? `data:${
            item.afterPhoto.contentType
          };base64,${item.afterPhoto.data.toString("base64")}`
        : null,
    };
    res.json(formattedItem);
  } catch (err) {
    console.error("Error fetching item:", err);
    res.status(500).json({ message: "Error fetching item" });
  }
};

/**
 * Creates a new item with optional file uploads.
 */
const createItem = async (req, res) => {
  const { tab } = req.params;
  const model = getModelByTab(tab);

  if (!model) {
    return res.status(400).json({ message: "Invalid collection/tab" });
  }

  try {
    let beforePhoto = null,
      afterPhoto = null;

    if (req.files.beforePhoto) {
      const file = req.files.beforePhoto[0];
      beforePhoto = await compressImage(file.path);
    }

    if (req.files.afterPhoto) {
      const file = req.files.afterPhoto[0];
      afterPhoto = await compressImage(file.path);
    }

    const newItem = new model({
      ...req.body,
      beforePhoto,
      afterPhoto,
    });

    const savedItem = await newItem.save();
    cleanUpTemporaryFiles(req.files);

    res.status(201).json(savedItem);
  } catch (err) {
    console.error("Error creating item:", err);
    res.status(400).json({ message: "Error creating item" });
  }
};

/**
 * Updates an existing item by ID with optional file uploads.
 */
const updateItem = async (req, res) => {
  const { tab, id } = req.params;
  const model = getModelByTab(tab);

  if (!model) {
    return res.status(400).json({ message: "Invalid collection/tab" });
  }

  try {
    let beforePhoto = null,
      afterPhoto = null;

    if (req.files.beforePhoto) {
      const file = req.files.beforePhoto[0];
      beforePhoto = await compressImage(file.path);
    }

    if (req.files.afterPhoto) {
      const file = req.files.afterPhoto[0];
      afterPhoto = await compressImage(file.path);
    }

    const updateData = { ...req.body };
    if (beforePhoto) updateData.beforePhoto = beforePhoto;
    if (afterPhoto) updateData.afterPhoto = afterPhoto;

    const updatedItem = await model.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    cleanUpTemporaryFiles(req.files);
    res.json(updatedItem);
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(400).json({ message: "Error updating item" });
  }
};

/**
 * Deletes an item by ID.
 */
const deleteItem = async (req, res) => {
  const { tab, id } = req.params;
  const model = getModelByTab(tab);

  if (!model) {
    return res.status(400).json({ message: "Invalid collection/tab" });
  }

  try {
    const deletedItem = await model.findByIdAndDelete(id);
    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json({ message: "Item deleted successfully!" });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ message: "Error deleting item" });
  }
};

// ------------------------ Exports ------------------------

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
};
