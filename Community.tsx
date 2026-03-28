import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, query, orderBy, getDocs, addDoc, updateDoc, doc, increment } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import { Heart, MessageCircle, Send, User as UserIcon } from "lucide-react";

interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: number;
}

interface Post {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: number;
  likes: number;
  likedBy: string[];
  comments: Comment[];
}

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [commentingOn, setCommentingOn] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");

  const fetchPosts = async () => {
    try {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const postsData = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        likedBy: doc.data().likedBy || [],
        comments: doc.data().comments || []
      })) as Post[];
      setPosts(postsData);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (!user) return;
    setLoading(true);

    try {
      const newPostData = {
        userId: user.uid,
        userName: user.name || "Anonymous",
        content,
        createdAt: Date.now(),
        likes: 0,
        likedBy: [],
        comments: []
      };

      await addDoc(collection(db, "posts"), newPostData);
      setContent("");
      fetchPosts();
    } catch (err) {
      console.error("Error creating post:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    try {
      const postRef = doc(db, "posts", postId);
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const isLiked = post.likedBy.includes(user.uid);
      const newLikedBy = isLiked 
        ? post.likedBy.filter(id => id !== user.uid)
        : [...post.likedBy, user.uid];
      
      const newLikes = isLiked ? post.likes - 1 : post.likes + 1;

      await updateDoc(postRef, {
        likedBy: newLikedBy,
        likes: Math.max(0, newLikes)
      });
      fetchPosts();
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!user || !newComment.trim()) return;
    try {
      const postRef = doc(db, "posts", postId);
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const comment: Comment = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user.uid,
        userName: user.name || "Anonymous",
        text: newComment,
        createdAt: Date.now()
      };

      await updateDoc(postRef, {
        comments: [...post.comments, comment]
      });
      setNewComment("");
      fetchPosts();
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <h1 className="text-4xl font-black tracking-tighter text-gray-900 mb-4 uppercase">
          COMMUNITY <span className="text-orange-500 italic">FEED</span>
        </h1>
        <p className="text-gray-600">
          Share your progress, celebrate wins, and inspire others on their journey.
        </p>
      </motion.div>

      {/* Create Post */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-10"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shrink-0">
              <UserIcon className="w-6 h-6" />
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none resize-none min-h-[100px]"
            />
          </div>

          <div className="flex items-center justify-end pt-2 border-t border-gray-50">
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
              <span>{loading ? "Posting..." : "Post"}</span>
            </button>
          </div>
        </form>
      </motion.div>

      {/* Posts Feed */}
      <div className="space-y-8">
        {fetching ? (
          <div className="text-center py-20 text-gray-500">Loading feed...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No posts yet. Be the first to share!</div>
        ) : (
          posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{post.userName}</h3>
                    <p className="text-xs text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()} at{" "}
                      {new Date(post.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                {post.content && <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>}
              </div>
              <div className="p-4 border-t border-gray-50 flex items-center gap-6">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-2 transition-colors ${
                    post.likedBy.includes(user?.uid || "") ? "text-red-500" : "text-gray-500 hover:text-red-500"
                  }`}
                >
                  <Heart className={`w-6 h-6 ${post.likedBy.includes(user?.uid || "") ? "fill-current" : ""}`} />
                  <span className="text-sm font-bold">{post.likes}</span>
                </button>
                <button 
                  onClick={() => setCommentingOn(commentingOn === post.id ? null : post.id)}
                  className="flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors"
                >
                  <MessageCircle className="w-6 h-6" />
                  <span className="text-sm font-bold">{post.comments.length} Comments</span>
                </button>
              </div>

              {/* Comments Section */}
              <AnimatePresence>
                {commentingOn === post.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pb-6 border-t border-gray-50 overflow-hidden"
                  >
                    <div className="pt-4 space-y-4 mb-4 max-h-60 overflow-y-auto pr-2">
                      {post.comments.length > 0 ? (
                        post.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 shrink-0">
                              <UserIcon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 bg-gray-50 p-3 rounded-2xl">
                              <p className="text-xs font-bold text-gray-900 mb-1">{comment.userName}</p>
                              <p className="text-sm text-gray-700">{comment.text}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-400 text-sm py-4">No comments yet. Be the first!</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        disabled={!newComment.trim()}
                        className="bg-orange-500 text-white p-2 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
