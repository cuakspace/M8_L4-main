const multer = require("multer");
const path = require("path");

const uploadsPath = path.join(__dirname, "../../../frontend/public/uploads");

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadsPath),
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    callback(null, uniqueName);
  },
});

const imageTypes = ["image/jpeg", "image/png", "image/webp"];

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (imageTypes.includes(file.mimetype)) return callback(null, true);

    const error = new Error("La portada debe ser una imagen JPG, PNG o WEBP");
    error.status = 400;
    return callback(error);
  },
});

module.exports = upload;
