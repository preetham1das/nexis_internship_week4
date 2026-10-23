const multer = require("multer");

// Use memory storage — the file buffer is held in req.file.buffer.
// The route converts it to a Base64 data URL and saves it in MongoDB,
// so nothing is written to the server disk (which is ephemeral on Render).
const storage = multer.memoryStorage();

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,   // 10 MB — keeps Base64 size under MongoDB's 16 MB doc limit
    files: 1,
    fields: 5,
    parts: 6,
    fieldSize: 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      const error = new Error("Choose a JPG, PNG, WebP, or GIF image file.");
      error.status = 400;
      return callback(error);
    }
    callback(null, true);
  },
});

module.exports = upload;
