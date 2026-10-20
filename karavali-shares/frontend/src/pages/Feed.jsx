import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, MapPin, Plus, Send, Trash2, Image as ImageIcon, Video, LoaderCircle, Waves } from "lucide-react";
import api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

const categories = ["All", "Kambala", "Daiva Kola", "Karavali Food", "Yakshagana", "Festivals", "Tulu Culture", "Other"];
const landingStories = [
  {
    category: "Yakshagana",
    title: "Stories brought to life",
    description: "Colorful costumes, expressive movement and music make every performance unforgettable.",
    image: "/images/yakshagana.jpg",
    alt: "Yakshagana performers in traditional costumes",
    credit: "Vinay.hegde2",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    source: "https://commons.wikimedia.org/wiki/File:Yakshagana_Performance.jpg"
  },
  {
    category: "Kambala",
    title: "A tradition in motion",
    description: "Celebrate the spirit, skill and community behind the coastal buffalo races.",
    image: "/images/kambala.jpg",
    alt: "Buffaloes racing at a Kambala event in Udupi district",
    credit: "Rayabhari",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    source: "https://commons.wikimedia.org/wiki/File:Kambala,_he-buffalo_race_at_Vandar_village,_Udupi_Dist.,_Kar._India.jpg"
  },
  {
    category: "Daiva Kola",
    title: "Ritual, reverence and memory",
    description: "Discover the living heritage and sacred traditions of coastal Karnataka.",
    image: "/images/daiva-kola.jpg",
    alt: "A performer dressed as Jarandaya Daiva",
    credit: "Sukesh poojary",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    source: "https://commons.wikimedia.org/wiki/File:Jarandaya_daiva_05.jpg"
  },
  {
    category: "Karavali Food",
    title: "Flavors from the coast",
    description: "From family recipes to Mangalorean fish curry, food carries a taste of home.",
    image: "/images/mangalorean-fish-curry.jpg",
    alt: "Mangalorean Bangude fish curry",
    credit: "Yakshitha",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    source: "https://commons.wikimedia.org/wiki/File:Mangalorean_Bangude_Fish_Curry.jpg"
  }
];

function timeAgo(date) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function PostCard({ post, onLike, onComment, onDelete, user }) {
  const [comment, setComment] = useState("");
  const [commentBusy, setCommentBusy] = useState(false);
  const mediaSource = post.mediaUrl?.startsWith("/")
    ? new URL(post.mediaUrl, new URL(api.defaults.baseURL, window.location.origin)).href
    : post.mediaUrl;

  async function sendComment(event) {
    event.preventDefault();
    if (!comment.trim()) return;
    setCommentBusy(true);
    const success = await onComment(post._id, comment.trim());
    if (success) setComment("");
    setCommentBusy(false);
  }

  return (
    <article className="post-card">
      <div className="post-heading">
        <div className="avatar">{(post.authorName || "K").slice(0, 1).toUpperCase()}</div>
        <div className="post-author"><strong>{post.authorName}</strong><span>{timeAgo(post.createdAt)}{post.location ? ` · ${post.location}` : ""}</span></div>
        <span className="category-tag">{post.category}</span>
        {user?.id === post.author?.toString() && <button className="icon-button delete-button" title="Delete post" onClick={() => onDelete(post._id)}><Trash2 size={17} /></button>}
      </div>
      <p className="post-caption">{post.caption}</p>
      {post.mediaUrl && (
        post.mediaType === "video" ? (
          <video className="post-media" src={mediaSource} controls preload="metadata" />
        ) : (
          <img className="post-media" src={mediaSource} alt={post.caption} loading="lazy" onError={(e) => { e.currentTarget.style.display = "none"; }} />
        )
      )}
      <div className="post-stats"><span>{post.likesCount ?? post.likes?.length ?? 0} likes</span><span>{post.comments?.length || 0} comments</span></div>
      <div className="post-actions">
        <button className={post.likedByMe ? "action-button liked" : "action-button"} onClick={() => onLike(post._id)}><Heart size={18} fill={post.likedByMe ? "currentColor" : "none"} /> Like</button>
        <a className="action-button" href={`#comments-${post._id}`}><MessageCircle size={18} /> Comment</a>
      </div>
      {!!post.comments?.length && <div className="comments-list" id={`comments-${post._id}`}>
        {post.comments.slice(-3).map((item) => <p className="comment" key={item._id}><strong>{item.userName}</strong> {item.text}</p>)}
      </div>}
      <form className="comment-form" onSubmit={sendComment}>
        <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder={user ? "Write a comment..." : "Login to comment"} maxLength={500} disabled={!user || commentBusy} />
        <button aria-label="Send comment" disabled={!user || !comment.trim() || commentBusy}><Send size={17} /></button>
      </form>
    </article>
  );
}

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({ caption: "", category: "Kambala", location: "", mediaUrl: "", mediaType: "image", mediaFile: null });
  const [posting, setPosting] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const mediaInputRef = useRef(null);

  const loadPosts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    try {
      const params = activeCategory === "All" ? {} : { category: activeCategory };
      const { data } = await api.get("/posts", { params });
      setPosts(data);
    } catch (err) {
      setError(err.response?.data?.message || "Cannot load posts. Make sure the backend is running and MongoDB is connected.");
    } finally { setLoading(false); }
  }, [activeCategory, user]);

  useEffect(() => {
    if (user) loadPosts();
    else {
      setPosts([]);
      setLoading(false);
    }
  }, [loadPosts, user]);

  async function createPost(event) {
    event.preventDefault();
    setNotice("");
    setError("");
    setPosting(true);
    try {
      const postData = new FormData();
      postData.append("caption", form.caption);
      postData.append("category", form.category);
      postData.append("location", form.location);
      postData.append("mediaUrl", form.mediaUrl);
      postData.append("mediaType", form.mediaType);
      if (form.mediaFile) postData.append("media", form.mediaFile);
      await api.post("/posts", postData);
      if (mediaInputRef.current) mediaInputRef.current.value = "";
      setForm({ caption: "", category: "Kambala", location: "", mediaUrl: "", mediaType: "image", mediaFile: null });
      setShowComposer(false);
      setNotice("Your post has been shared!");
      await loadPosts();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create post. Please log in again if needed.");
    } finally { setPosting(false); }
  }

  async function likePost(id) {
    if (!user) { setNotice("Please log in to like posts."); return; }
    try {
      const { data } = await api.put(`/posts/${id}/like`);
      setPosts(old => old.map(p => p._id === id ? { ...p, likesCount: data.likesCount, likedByMe: data.likedByMe } : p));
    } catch (err) { setError(err.response?.data?.message || "Could not update like."); }
  }

  async function commentPost(id, text) {
    if (!user) { setNotice("Please log in to comment."); return false; }
    try {
      const { data } = await api.post(`/posts/${id}/comments`, { text });
      setPosts(old => old.map(p => p._id === id ? { ...p, comments: [...(p.comments || []), data] } : p));
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Could not add comment.");
      return false;
    }
  }

  async function deletePost(id) {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    try {
      await api.delete(`/posts/${id}`);
      setPosts(old => old.filter(p => p._id !== id));
      setNotice("Post deleted.");
    } catch (err) { setError(err.response?.data?.message || "Could not delete post."); }
  }

  if (!user) {
    return (
      <main className="page-shell">
        <section className="hero">
          <div className="hero-content">
            <span className="hero-kicker"><Waves size={16} /> NAMMA KARAVALI</span>
            <h1>Our coast. Our stories.<br /><em>Our culture.</em></h1>
            <p>A place to celebrate coastal Karnataka — from Kambala and Daiva Kola to family recipes, festivals and Yakshagana.</p>
            <Link className="hero-button" to="/register">Join the community <Plus size={18} /></Link>
            <p><Link to="/login">Already a member? Log in</Link></p>
          </div>
          <div className="hero-badge"><span>ಕರಾವಳಿ</span><small>Culture · Food · People</small></div>
          <div className="hero-decoration decoration-one"></div><div className="hero-decoration decoration-two"></div>
        </section>
        <section className="landing-stories" aria-labelledby="landing-stories-title">
          <div className="landing-stories-panel">
            <div className="landing-stories-content">
              <p className="eyebrow">A COAST FULL OF STORIES</p>
              <h2 id="landing-stories-title">Explore the heart of Karavali</h2>
              <p>From the vibrant colors of Yakshagana and Daiva Kola to Kambala fields and coastal kitchens, discover the traditions that make our coast unique.</p>
              <div className="landing-story-tags">
                {landingStories.map(story => <span key={story.category}>{story.category}</span>)}
              </div>
            </div>
            <div className="landing-photo-credits" aria-label="Photo credits">
              {landingStories.map(story => (
                <a href={story.source} target="_blank" rel="noreferrer" key={story.category}>
                  {story.category}: {story.credit} · {story.license}
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-content">
          <span className="hero-kicker"><Waves size={16} /> NAMMA KARAVALI</span>
          <h1>Our coast. Our stories.<br /><em>Our culture.</em></h1>
          <p>A place to celebrate coastal Karnataka — from Kambala and Daiva Kola to family recipes, festivals and Yakshagana.</p>
          {user ? <button className="hero-button" onClick={() => setShowComposer(v => !v)}><Plus size={18} /> Share your story</button> : <Link className="hero-button" to="/register">Join the community <Plus size={18} /></Link>}
        </div>
        <div className="hero-badge"><span>ಕರಾವಳಿ</span><small>Culture · Food · People</small></div>
        <div className="hero-decoration decoration-one"></div><div className="hero-decoration decoration-two"></div>
      </section>

      <div className="feed-layout">
        <aside className="sidebar">
          <div className="sidebar-card">
            <p className="sidebar-title">EXPLORE THE COAST</p>
            {categories.map(category => <button key={category} className={`category-button ${activeCategory === category ? "selected" : ""}`} onClick={() => setActiveCategory(category)}>{category === "Karavali Food" ? <span>🍲</span> : category === "Kambala" ? <span>🐃</span> : category === "Daiva Kola" ? <span>🔥</span> : category === "Yakshagana" ? <span>🎭</span> : category === "Festivals" ? <span>🎉</span> : category === "Tulu Culture" ? <span>🌴</span> : <span>✦</span>}{category}</button>)}
          </div>
          <div className="sidebar-note"><strong>Keep our culture alive.</strong><p>Share your memories, recipes and traditions with the Karavali community.</p></div>
        </aside>

        <section className="feed-column">
          <div className="feed-heading"><div><p className="eyebrow">COMMUNITY STORIES</p><h2>{activeCategory === "All" ? "The latest from Karavali" : activeCategory}</h2></div><span className="feed-count">{posts.length} posts</span></div>
          {notice && <div className="notice-message">{notice}<button onClick={() => setNotice("")}>×</button></div>}
          {error && <div className="error-message">{error}<button onClick={() => setError("")}>×</button></div>}

          {showComposer && user && <form className="composer-card" onSubmit={createPost}>
            <div className="composer-title"><div className="avatar">{user.name.slice(0, 1).toUpperCase()}</div><div><strong>Share with Karavali</strong><span>What's happening in your community?</span></div></div>
            <textarea value={form.caption} onChange={e => setForm({ ...form, caption: e.target.value })} required maxLength={2000} placeholder="Share a story, recipe, event or cultural memory..." />
            <div className="form-grid">
              <label>Category<select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{categories.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}</select></label>
              <label>Location (optional)<input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Udupi" maxLength={100} /></label>
            </div>
            <label className="field-label">Choose a photo or video from your device (optional)<input ref={mediaInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime" onChange={event => {
              const mediaFile = event.target.files?.[0];
              if (!mediaFile) return;
              if (mediaFile && mediaFile.size > (mediaFile.type.startsWith("video/") ? 100 : 10) * 1024 * 1024) {
                setError(mediaFile.type.startsWith("video/") ? "Videos must be 100 MB or smaller." : "Images must be 10 MB or smaller.");
                event.target.value = "";
                setForm({ ...form, mediaFile: null });
                return;
              }
              setError("");
              setForm({ ...form, mediaFile, mediaUrl: "" });
            }} /></label>
            {form.mediaFile && <p className="selected-media">{form.mediaFile.name} <button type="button" onClick={() => { if (mediaInputRef.current) mediaInputRef.current.value = ""; setForm({ ...form, mediaFile: null }); }}>Remove</button></p>}
            <label className="field-label">Or add a public photo/video URL<input type="url" value={form.mediaUrl} onChange={e => { if (mediaInputRef.current) mediaInputRef.current.value = ""; setForm({ ...form, mediaUrl: e.target.value, mediaFile: null }); }} placeholder="https://example.com/your-photo.jpg" /></label>
            {form.mediaUrl && <label className="media-type-choice">Media type <select value={form.mediaType} onChange={e => setForm({ ...form, mediaType: e.target.value })}><option value="image">Photo</option><option value="video">Video</option></select></label>}
            <div className="composer-bottom"><span><ImageIcon size={16} /> Images up to 10 MB <Video size={16} /> Videos up to 100 MB</span><button className="primary-button" disabled={posting}>{posting ? "Sharing..." : "Publish post"}</button></div>
          </form>}

          {loading ? <div className="loading-state"><LoaderCircle className="spin" size={28} /><p>Loading community stories...</p></div> :
            posts.length ? <div className="posts-list">{posts.map(post => <PostCard key={post._id} post={post} user={user} onLike={likePost} onComment={commentPost} onDelete={deletePost} />)}</div> :
              <div className="empty-state"><div className="empty-icon"><Waves size={27} /></div><h3>No posts here yet</h3><p>Be the first to share a story from coastal Karnataka.</p>{user && <button className="primary-button" onClick={() => setShowComposer(true)}>Create the first post</button>}</div>}
        </section>

        <aside className="right-sidebar">
          <div className="culture-card"><p className="eyebrow">OUR HERITAGE</p><h3>Stories worth keeping.</h3><p>Every recipe, festival, performance and tradition carries a piece of our home.</p><div className="culture-tags"><span>ತುಳು</span><span>ಕರಾವಳಿ</span><span>Tradition</span></div></div>
          <div className="community-tip"><strong>Share thoughtfully</strong><p>Respect cultural traditions, ask permission before posting private footage, and share only media you have the right to use.</p></div>
        </aside>
      </div>
    </main>
  );
}
