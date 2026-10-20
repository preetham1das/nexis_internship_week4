require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (_req, res) => {
  res.json({ message: "Welcome to Karavali Shares API" });
});
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` }));

app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.code === "LIMIT_FILE_SIZE" ? 413 : err.status || 500;
  const message = err.code === "LIMIT_FILE_SIZE"
    ? "Media must be 100 MB or smaller."
    : err.message || "Server error";
  res.status(status).json({ message });
});

async function start() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is missing. Add it to backend/.env");
    process.exit(1);
  }
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is missing. Add it to backend/.env");
    process.exit(1);
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Karavali Shares API running on port ${PORT}`));
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}
start();
