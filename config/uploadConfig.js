const multer = require("multer");
const path = require("path");

// Directory to save uploaded files
const UPLOADS_DIR = "uploads/";

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(`Saving file to directory: ${UPLOADS_DIR}`);
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const fileName = `${file.fieldname}-${uniqueSuffix}${path.extname(
      file.originalname
    )}`;
    console.log(`Generated filename: ${fileName}`);
    cb(null, fileName);
  },
});

// File type validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/; // Add more as needed
  const extName = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimeType = allowedTypes.test(file.mimetype);

  if (extName && mimeType) {
    console.log(`File accepted: ${file.originalname}`);
    cb(null, true);
  } else {
    console.warn(`File rejected: ${file.originalname}`);
    cb(
      new Error("Invalid file type. Only JPEG, JPG, PNG, and GIF are allowed."),
      false
    );
  }
};

// Initialize multer with storage and file validation
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5 MB
});

module.exports = upload;
