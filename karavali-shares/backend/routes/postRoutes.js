const express = require("express");
const mongoose = require("mongoose");
const Post = require("../models/Post");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();
const categories = ["Kambala", "Daiva Kola", "Karavali Food", "Yakshagana", "Festivals", "Tulu Culture", "Other"];

// ─── GET /api/posts ──────────────────────────────────────────────────────────
router.get("/", auth, async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category && categories.includes(req.query.category)) {
      filter.category = req.query.category;
    }
    const posts = await Post.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    res.json(posts.map(post => ({
      ...post,
      likesCount: post.likes.length,
      likedByMe: req.user ? post.likes.some(id => id.toString() === req.user.id) : false,
    })));
  } catch (error) { next(error); }
});

// ─── POST /api/posts ─────────────────────────────────────────────────────────
router.post("/", auth, upload.single("media"), async (req, res, next) => {
  try {
    const caption  = String(req.body.caption  || "").trim();
    const category = categories.includes(req.body.category) ? req.body.category : "Other";
    const location = String(req.body.location || "").trim();

    // Default to any user-supplied public URL
    let mediaUrl  = String(req.body.mediaUrl  || "").trim();
    let mediaType = ["image", "video"].includes(req.body.mediaType) && mediaUrl
      ? req.body.mediaType
      : "none";

    // ── Validation ────────────────────────────────────────────────────────
    if (!caption) {
      return res.status(400).json({ message: "Please add a caption." });
    }
    if (caption.length > 2000) {
      return res.status(400).json({ message: "Caption is too long." });
    }
    if (mediaUrl && !/^https?:\/\//i.test(mediaUrl)) {
      return res.status(400).json({ message: "Media URL must start with http:// or https://." });
    }

    // ── Convert uploaded file to Base64 data URL (stored in MongoDB) ──────
    // Because MongoDB is a persistent database (unlike the server's local disk
    // which is wiped on every Render restart), the image survives permanently.
    if (req.file) {
      const base64 = req.file.buffer.toString("base64");
      mediaUrl  = `data:${req.file.mimetype};base64,${base64}`;
      mediaType = "image";
    }

    const post = await Post.create({
      author: req.user.id,
      authorName: req.user.name,
      caption,
      category,
      location,
      mediaUrl,
      mediaType,
    });

    res.status(201).json({ ...post.toObject(), likesCount: 0, likedByMe: false });
  } catch (error) { next(error); }
});

// ─── PUT /api/posts/:id/like ─────────────────────────────────────────────────
router.put("/:id/like", auth, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid post ID." });
    }
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });

    const userId = req.user.id;
    const alreadyLiked = post.likes.some(id => id.toString() === userId);
    if (alreadyLiked) post.likes.pull(userId);
    else post.likes.addToSet(userId);
    await post.save();

    res.json({ likesCount: post.likes.length, likedByMe: !alreadyLiked });
  } catch (error) { next(error); }
});

// ─── POST /api/posts/:id/comments ────────────────────────────────────────────
router.post("/:id/comments", auth, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid post ID." });
    }
    const text = String(req.body.text || "").trim();
    if (!text) return res.status(400).json({ message: "Comment cannot be empty." });
    if (text.length > 500) return res.status(400).json({ message: "Comment must be 500 characters or less." });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });

    post.comments.push({ user: req.user.id, userName: req.user.name, text });
    await post.save();
    res.status(201).json(post.comments[post.comments.length - 1]);
  } catch (error) { next(error); }
});

// ─── DELETE /api/posts/:id ───────────────────────────────────────────────────
router.delete("/:id", auth, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid post ID." });
    }
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can delete only your own posts." });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted." });
  } catch (error) { next(error); }
});

module.exports = router;
