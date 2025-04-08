const express = require("express");
const router = express.Router();
const upload = require("../config/uploadConfig");
const projectController = require("../controllers/projectController");

// Middleware to log route activity
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Route to GET all items in a collection
router.get("/:tab", projectController.getAllItems);

// Route to GET a specific item by ID
router.get("/:tab/:id", projectController.getItemById);

// Route to POST (create) a new item with file uploads
router.post(
  "/:tab",
  upload.fields([
    { name: "beforePhoto", maxCount: 1 },
    { name: "afterPhoto", maxCount: 1 },
  ]),
  projectController.createItem
);

// Route to PUT (update) an item by ID with file uploads
router.put(
  "/:tab/:id",
  upload.fields([
    { name: "beforePhoto", maxCount: 1 },
    { name: "afterPhoto", maxCount: 1 },
  ]),
  projectController.updateItem
);

// Route to DELETE an item by ID
router.delete("/:tab/:id", projectController.deleteItem);

module.exports = router;
