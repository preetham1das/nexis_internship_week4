const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },
  text: { type: String, required: true, trim: true, maxlength: 500 }
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  authorName: { type: String, required: true },
  caption: { type: String, required: true, trim: true, maxlength: 2000 },
  category: {
    type: String,
    enum: ["Kambala", "Daiva Kola", "Karavali Food", "Yakshagana", "Festivals", "Tulu Culture", "Other"],
    default: "Other"
  },
  location: { type: String, trim: true, maxlength: 100, default: "" },
  mediaUrl: { type: String, trim: false, default: "" },
  mediaType: { type: String, enum: ["image", "video", "none"], default: "none" },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [commentSchema]
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);
