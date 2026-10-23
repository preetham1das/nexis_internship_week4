const path = require("path");

// Legacy local upload directory — kept so /uploads static route in server.js
// still serves any files that were uploaded before this change.
const uploadDirectory = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, "..", "uploads");

module.exports = { uploadDirectory };
