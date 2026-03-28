import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User as UserIcon, Send, ArrowLeft, Loader2, Bot, Trash2, Image as ImageIcon, Video, X, Paperclip } from "lucide-react";
import { Link } from "react-router-dom";
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";

interface Message {
  role: "user" | "model";
  text: string;
  media?: {
    url: string;
    type: "image" | "video";
  };
}

export default function AITrainer() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", text: "Hello! I'm your AI Fitness Assistant. You can chat with me, or upload photos of your physique/meals and videos of your exercises for instant analysis. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        alert("File size must be under 20MB.");
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setFilePreview(url);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedFile) || loading) return;

    const userMessage = input.trim();
    const currentFile = selectedFile;
    const currentPreview = filePreview;
    
    setInput("");
    clearFile();

    const newMessage: Message = { 
      role: "user", 
      text: userMessage || (currentFile?.type.startsWith("image") ? "Analyze this image" : "Analyze this video")
    };
    
    if (currentFile && currentPreview) {
      newMessage.media = {
        url: currentPreview,
        type: currentFile.type.startsWith("image") ? "image" : "video"
      };
    }

    setMessages(prev => [...prev, newMessage]);
    setLoading(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API Key is not configured.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      let parts: any[] = [{ text: userMessage || "Analyze the attached media." }];
      
      if (currentFile) {
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(currentFile);
        });
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: currentFile.type
          }
        });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts }],
        config: {
          systemInstruction: `You are a professional AI Fitness Assistant. 
          Capabilities:
          1. General Fitness/Nutrition Advice: Provide science-based, engaging advice.
          2. Physique Analysis: If an image of a person is provided, analyze body composition, posture, and muscle development.
          3. Food Analysis: If an image of food is provided, estimate macros (calories, protein, carbs, fats) and healthiness.
          4. Exercise Form Analysis: If a video is provided, analyze the technique and provide specific corrections.
          
          Style: Short, organized, and encouraging. Use bold text for key points. Always prioritize safety.`,
        }
      });

      setMessages(prev => [...prev, { role: "model", text: response.text || "I couldn't analyze that. Please try again." }]);
    } catch (error: any) {
      console.error("[AITrainer] Error:", error);
      setMessages(prev => [...prev, { role: "model", text: `Error: ${error.message || "Failed to get response."}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto pb-20 flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-orange-500 font-bold transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </Link>
        <button 
          onClick={() => setMessages([{ role: "model", text: "Hello! I'm your AI Fitness Trainer. How can I help you reach your goals today?" }])}
          className="text-gray-400 hover:text-red-500 transition-colors"
          title="Clear Chat"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 flex-1 flex flex-col overflow-hidden min-h-[600px]">
        {/* Header */}
        <div className="p-6 border-b border-gray-50 flex items-center gap-4 bg-orange-500 text-white">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tighter uppercase">AI Fitness Trainer</h2>
            <p className="text-orange-100 text-xs font-bold uppercase tracking-widest">Always Active</p>
          </div>
        </div>

        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
        >
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex items-start gap-3",
                m.role === "user" ? "flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                m.role === "user" ? "bg-blue-500 text-white" : "bg-orange-100 text-orange-600"
              )}>
                {m.role === "user" ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={cn(
                "max-w-[80%] space-y-2",
                m.role === "user" ? "text-right" : "text-left"
              )}>
                {m.media && (
                  <div className={cn(
                    "rounded-2xl overflow-hidden border border-gray-100 shadow-sm mb-2",
                    m.role === "user" ? "ml-auto" : "mr-auto"
                  )}>
                    {m.media.type === "image" ? (
                      <img src={m.media.url} alt="Uploaded" className="max-w-xs w-full h-auto" />
                    ) : (
                      <video src={m.media.url} className="max-w-xs w-full h-auto" controls />
                    )}
                  </div>
                )}
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed inline-block text-left",
                  m.role === "user" 
                    ? "bg-blue-500 text-white rounded-tr-none" 
                    : "bg-gray-100 text-gray-700 rounded-tl-none"
                )}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {m.text}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-none">
                <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-6 border-t border-gray-50 bg-gray-50/50 space-y-4">
          <AnimatePresence>
            {filePreview && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative inline-block"
              >
                <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-orange-500 shadow-lg">
                  {selectedFile?.type.startsWith("image") ? (
                    <img src={filePreview} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white">
                      <Video className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <button 
                  onClick={clearFile}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSend} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={selectedFile ? "Add a message or press send..." : "Ask about workouts, diet, or upload media..."}
                className="w-full pl-6 pr-12 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all shadow-sm"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 text-gray-400 hover:text-orange-500 transition-colors flex items-center justify-center"
                title="Upload Image/Video"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,video/*"
                className="hidden"
              />
            </div>
            <button
              type="submit"
              disabled={loading || (!input.trim() && !selectedFile)}
              className="w-14 h-14 bg-orange-500 text-white rounded-2xl flex items-center justify-center hover:bg-orange-600 transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20 shrink-0"
            >
              <Send className="w-6 h-6" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
