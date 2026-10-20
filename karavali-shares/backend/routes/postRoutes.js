const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs/promises");
const path = require("path");
const Post = require("../models/Post");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();
const categories = ["Kambala", "Daiva Kola", "Karavali Food", "Yakshagana", "Festivals", "Tulu Culture", "Other"];

router.get("/", auth, async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category && categories.includes(req.query.category)) filter.category = req.query.category;
    const posts = await Post.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    res.json(posts.map(post => ({
      ...post,
      likesCount: post.likes.length,
      likedByMe: req.user ? post.likes.some(id => id.toString() === req.user.id) : false
    })));
  } catch (error) { next(error); }
});

router.post("/", auth, upload.single("media"), async (req, res, next) => {
  try {
    const caption = String(req.body.caption || "").trim();
    const category = categories.includes(req.body.category) ? req.body.category : "Other";
    const location = String(req.body.location || "").trim();
    let mediaUrl = String(req.body.mediaUrl || "").trim();
    let mediaType = ["image", "video"].includes(req.body.mediaType) && mediaUrl ? req.body.mediaType : "none";

    const removeUploadedFile = async () => {
      if (!req.file) return;
      try {
        await fs.unlink(req.file.path);
      } catch (error) {
        if (error.code !== "ENOENT") console.error("Could not remove rejected media upload:", error);
      }
    };

    if (!caption) {
      await removeUploadedFile();
      return res.status(400).json({ message: "Please add a caption." });
    }
    if (caption.length > 2000) {
      await removeUploadedFile();
      return res.status(400).json({ message: "Caption is too long." });
    }
    if (mediaUrl && !/^https?:\/\//i.test(mediaUrl)) {
      await removeUploadedFile();
      return res.status(400).json({ message: "Media URL must start with http:// or https://." });
    }
    if (req.file) {
      if (req.file.mimetype.startsWith("image/") && req.file.size > 10 * 1024 * 1024) {
        await removeUploadedFile();
        return res.status(413).json({ message: "Images must be 10 MB or smaller." });
      }
      mediaUrl = `/uploads/${path.basename(req.file.filename)}`;
      mediaType = req.file.mimetype.startsWith("video/") ? "video" : "image";
    }

    const post = await Post.create({
      author: req.user.id, authorName: req.user.name, caption, category, location, mediaUrl, mediaType
    });
    res.status(201).json({ ...post.toObject(), likesCount: 0, likedByMe: false });
  } catch (error) {
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        if (cleanupError.code !== "ENOENT") console.error("Could not remove failed media upload:", cleanupError);
      }
    }
    next(error);
  }
});

router.put("/:id/like", auth, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid post ID." });
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

router.post("/:id/comments", auth, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid post ID." });
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

router.delete("/:id", auth, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: "Invalid post ID." });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    if (post.author.toString() !== req.user.id) return res.status(403).json({ message: "You can delete only your own posts." });
    await post.deleteOne();
    res.json({ message: "Post deleted." });
  } catch (error) { next(error); }
});

module.exports = router;
