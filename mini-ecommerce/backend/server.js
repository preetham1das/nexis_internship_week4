require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Product = require("./models/Product");
const sampleProducts = require("./data/sampleProducts");

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Mini E-commerce API is running" });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));

// Start only after MongoDB connects
async function startServer() {
  try {
    if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
      throw new Error("MONGO_URI and JWT_SECRET must be configured");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");

    const existingProducts = await Product.find({}, "name").lean();
    const existingNames = new Set(existingProducts.map((product) => product.name));
    const missingProducts = sampleProducts.filter(
      (product) => !existingNames.has(product.name)
    );

    if (missingProducts.length > 0) {
      await Product.insertMany(missingProducts);
      console.log(`Added ${missingProducts.length} starter products`);
    }

    const productsWithUpdatedImages = sampleProducts.filter((product) =>
      [
        "Wireless Charging Pad",
        "Foldable Tablet Stand",
        "Weekend Jigsaw Puzzle",
        "Family Board Game",
      ].includes(product.name)
    );
    await Product.bulkWrite(
      productsWithUpdatedImages.map((product) => ({
        updateOne: {
          filter: { name: product.name },
          update: { $set: { image: product.image } },
        },
      }))
    );

    const port = process.env.PORT || 5000;

    app.listen(port, "0.0.0.0", () => {
      console.log(`Server running on port $DIL1`);
    });
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exit(1);
  }
}

startServer();