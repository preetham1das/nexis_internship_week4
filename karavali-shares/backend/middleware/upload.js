const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { uploadDirectory } = require("../config/mediaStorage");
const extensionsByMimeType = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "video/quicktime": ".mov"
};

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    fs.mkdir(uploadDirectory, { recursive: true }, error => callback(error, uploadDirectory));
  },
  filename: (_req, file, callback) => {
    callback(null, `${crypto.randomUUID()}${extensionsByMimeType[file.mimetype]}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024, files: 1, fields: 5, parts: 6, fieldSize: 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!extensionsByMimeType[file.mimetype]) {
      const error = new Error("Choose a JPG, PNG, WebP, GIF, MP4, WebM, or MOV file.");
      error.status = 400;
      return callback(error);
    }
    callback(null, true);
  }
});

module.exports = upload;
