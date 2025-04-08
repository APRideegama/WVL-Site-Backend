const express = require("express");
const router = express.Router();
const upload = require("../config/uploadConfig"); // Reusing your existing uploadConfig
const galleryController = require("../controllers/galleryController");

// Middleware to log route activity
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
router.get("/", galleryController.getAllItems);
router.get("/:id", galleryController.getItemById);
// Middleware to log incoming request before handling the upload
router.post(
  "/",
  (req, res, next) => {
    console.log("Request Body:", req.body);
    console.log("Files:", req.files); // Log the files if you expect multiple uploads
    next();
  },
  upload.single("image"),
  galleryController.createItem
);

router.put("/:id", upload.single("image"), galleryController.updateItem);
router.delete("/:id", galleryController.deleteItem);

module.exports = router;
