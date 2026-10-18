const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Could not fetch products" });
  }
});

// Add a product (basic development endpoint)
router.post("/", async (req, res) => {
  try {
    const { name, description, price, image } = req.body;

    if (!name?.trim() || price === undefined ||
        !Number.isFinite(price) || price < 0) {
      return res.status(400).json({
        message: "Valid name and price are required",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      description,
      price,
      image,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Could not add product" });
  }
});

module.exports = router;