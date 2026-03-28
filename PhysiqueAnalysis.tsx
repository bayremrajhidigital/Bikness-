import React, { useState, useRef } from "react";
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { Camera, Upload, Sparkles, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";

export default function PhysiqueAnalysis() {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzePhysique = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const base64Data = image.split(",")[1];

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: base64Data,
                },
              },
              {
                text: "Analyze this physique photo. Provide the response strictly in this format (less than 150 words):\n\nBody fat: [percentage]\n(3) features: [list 3 strong points]\n(3) problems: [list 3 areas for improvement]\n\nBe direct and professional. DO NOT include any other text.",
              },
            ],
          },
        ],
      });

      setAnalysis(response.text || "Could not generate analysis.");
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Failed to analyze physique. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link to="/dashboard" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>
            <h1 className="text-4xl font-black tracking-tighter text-gray-900 uppercase flex items-center gap-3">
              <Camera className="text-purple-500 w-10 h-10" />
              <span>Physique Analysis</span>
            </h1>
            <p className="text-gray-600 mt-2 font-medium">Professional AI-powered body composition and symmetry analysis.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-4 border-dashed rounded-[2rem] p-8 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[450px] overflow-hidden group ${
                image ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-purple-400 hover:bg-gray-100"
              }`}
            >
              {image ? (
                <>
                  <img src={image} alt="Physique" className="absolute inset-0 w-full h-full object-cover rounded-[1.8rem]" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white font-bold flex items-center gap-2 bg-black/50 px-6 py-3 rounded-full backdrop-blur-sm">
                      <Upload className="w-5 h-5" />
                      Change Photo
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div className="w-24 h-24 bg-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Camera className="text-purple-600 w-12 h-12" />
                  </div>
                  <p className="text-gray-900 font-black text-2xl uppercase tracking-tighter">Upload Photo</p>
                  <p className="text-gray-500 text-sm mt-2 font-medium">Front, back, or side view for best results</p>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            <button
              onClick={analyzePhysique}
              disabled={!image || loading}
              className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-2xl ${
                !image || loading
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                  : "bg-purple-600 text-white hover:bg-purple-700 shadow-purple-200 hover:-translate-y-1 active:translate-y-0"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Analyze My Physique
                </>
              )}
            </button>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4 text-red-600 shadow-sm"
              >
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                <p className="text-sm font-bold uppercase tracking-tight">{error}</p>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl p-10 min-h-[500px] flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="text-white w-6 h-6" />
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tighter">AI Report</h2>
              </div>
              {analysis && !loading && (
                <div className="px-4 py-1 bg-green-100 text-green-700 rounded-full text-xs font-black uppercase tracking-widest">
                  Verified
                </div>
              )}
            </div>

            <div className="flex-grow">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-full py-20 text-center"
                  >
                    <div className="relative mb-8">
                      <div className="w-24 h-24 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin" />
                      <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-600 w-10 h-10" />
                    </div>
                    <p className="text-gray-900 font-black text-2xl uppercase tracking-tighter mb-3">Scanning Physique</p>
                    <p className="text-gray-500 max-w-xs mx-auto font-medium">Our AI is analyzing muscle definition, symmetry, and body composition.</p>
                  </motion.div>
                ) : analysis ? (
                  <motion.div
                    key="analysis"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    <div className="bg-black rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
                      <div className="relative z-10">
                        <p className="text-gray-400 font-black uppercase tracking-widest text-xs mb-2">Estimated Body Fat</p>
                        <h3 className="text-6xl font-black tracking-tighter text-purple-400">
                          {analysis.match(/Body fat:\s*([\d.%]+)/i)?.[1] || "N/A"}
                        </h3>
                      </div>
                      <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
                      <Camera className="absolute right-8 top-1/2 -translate-y-1/2 w-24 h-24 text-white/5 rotate-12" />
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          Top Features
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                          {analysis.split(/features:/i)[1]?.split(/problems:/i)[0]?.split(/\n/).filter(l => l.trim().match(/^[- \d\.]/)).slice(0, 3).map((feature, i) => (
                            <div key={i} className="bg-white p-5 rounded-2xl border-2 border-gray-50 font-bold text-gray-800 flex items-center gap-4 shadow-sm hover:border-purple-100 transition-colors">
                              <span className="w-8 h-8 bg-purple-600 text-white rounded-xl flex items-center justify-center text-xs font-black">0{i+1}</span>
                              {feature.replace(/^[- \d\.]+/, "").trim()}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-orange-500" />
                          Areas for Focus
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                          {analysis.split(/problems:/i)[1]?.split(/\n/).filter(l => l.trim().match(/^[- \d\.]/)).slice(0, 3).map((problem, i) => (
                            <div key={i} className="bg-white p-5 rounded-2xl border-2 border-gray-50 font-bold text-gray-800 flex items-center gap-4 shadow-sm hover:border-orange-100 transition-colors">
                              <span className="w-8 h-8 bg-orange-500 text-white rounded-xl flex items-center justify-center text-xs font-black">0{i+1}</span>
                              {problem.replace(/^[- \d\.]+/, "").trim()}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full py-20 text-center text-gray-400"
                  >
                    <Camera className="w-16 h-16 mb-4 opacity-20" />
                    <p className="font-medium">Upload and analyze a photo to see your report here.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
