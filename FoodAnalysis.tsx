import React, { useState, useRef } from "react";
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { Utensils, Upload, Sparkles, ArrowLeft, Loader2, AlertCircle, CheckCircle2, PieChart } from "lucide-react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";

export default function FoodAnalysis() {
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

  const analyzeFood = async () => {
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
                text: "Analyze this meal photo. Provide ONLY the summary in exactly this format (STRICTLY LESS THAN 60 WORDS TOTAL):\n\nProteins: [amount]g\nCarbs: [amount]g\nFats: [amount]g\nNote: [one short sentence]\n\nDO NOT include any other text or explanations.",
              },
            ],
          },
        ],
      });

      setAnalysis(response.text || "Could not generate analysis.");
    } catch (err) {
      console.error("Analysis error:", err);
      setError("Failed to analyze meal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getMacroValue = (macro: string) => {
    if (!analysis) return "0";
    const regex = new RegExp(`${macro}:\\s*~?(\\d+)`, "i");
    const match = analysis.match(regex);
    return match ? match[1] : "0";
  };

  const getNote = () => {
    if (!analysis) return "";
    const split = analysis.split(/Note:/i);
    return split.length > 1 ? split[1].trim() : "";
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
              <Utensils className="text-green-500 w-10 h-10" />
              <span>Food Analysis</span>
            </h1>
            <p className="text-gray-600 mt-2 font-medium">Instant AI-powered macro and nutritional estimation.</p>
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
                image ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-400 hover:bg-gray-100"
              }`}
            >
              {image ? (
                <>
                  <img src={image} alt="Meal" className="absolute inset-0 w-full h-full object-cover rounded-[1.8rem]" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white font-bold flex items-center gap-2 bg-black/50 px-6 py-3 rounded-full backdrop-blur-sm">
                      <Upload className="w-5 h-5" />
                      Change Photo
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div className="w-24 h-24 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Utensils className="text-green-600 w-12 h-12" />
                  </div>
                  <p className="text-gray-900 font-black text-2xl uppercase tracking-tighter">Upload Meal</p>
                  <p className="text-gray-500 text-sm mt-2 font-medium">Clear photo for best results</p>
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
              onClick={analyzeFood}
              disabled={!image || loading}
              className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-2xl ${
                !image || loading
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                  : "bg-green-600 text-white hover:bg-green-700 shadow-green-200 hover:-translate-y-1 active:translate-y-0"
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
                  Analyze My Meal
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
                <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                  <PieChart className="text-white w-6 h-6" />
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tighter">Macro Report</h2>
              </div>
              {analysis && !loading && (
                <div className="px-4 py-1 bg-green-100 text-green-700 rounded-full text-xs font-black uppercase tracking-widest">
                  Estimated
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
                      <div className="w-24 h-24 border-4 border-green-100 border-t-green-600 rounded-full animate-spin" />
                      <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-green-600 w-10 h-10" />
                    </div>
                    <p className="text-gray-900 font-black text-2xl uppercase tracking-tighter mb-3">Scanning Meal</p>
                    <p className="text-gray-500 max-w-xs mx-auto font-medium">Our AI is identifying ingredients and estimating nutritional values.</p>
                  </motion.div>
                ) : analysis ? (
                  <motion.div
                    key="analysis"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    {/* Macros Grid - Modern Bento Style */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 text-center text-white shadow-lg shadow-blue-100">
                        <p className="text-blue-100 font-black uppercase tracking-widest text-[10px] mb-1">Protein</p>
                        <p className="text-3xl font-black">{getMacroValue("Proteins")}g</p>
                      </div>
                      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 text-center text-white shadow-lg shadow-orange-100">
                        <p className="text-orange-100 font-black uppercase tracking-widest text-[10px] mb-1">Carbs</p>
                        <p className="text-3xl font-black">{getMacroValue("Carbs")}g</p>
                      </div>
                      <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-3xl p-6 text-center text-white shadow-lg shadow-yellow-100">
                        <p className="text-yellow-100 font-black uppercase tracking-widest text-[10px] mb-1">Fats</p>
                        <p className="text-3xl font-black">{getMacroValue("Fats")}g</p>
                      </div>
                    </div>

                    {/* Total Calories Estimate - Modern Card */}
                    <div className="bg-black rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                      <div className="relative z-10">
                        <p className="text-gray-400 font-black uppercase tracking-widest text-xs mb-2">Estimated Calories</p>
                        <h3 className="text-6xl font-black tracking-tighter text-green-400">
                          {parseInt(getMacroValue("Proteins")) * 4 + parseInt(getMacroValue("Carbs")) * 4 + parseInt(getMacroValue("Fats")) * 9} <span className="text-2xl text-white">kcal</span>
                        </h3>
                      </div>
                      <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-green-500/10 rounded-full blur-3xl" />
                      <Utensils className="absolute right-8 top-1/2 -translate-y-1/2 w-24 h-24 text-white/5 rotate-12" />
                    </div>

                    {/* Note Section - Modern Typography */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-green-500" />
                        AI Insights
                      </h4>
                      <div className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-100 font-bold text-gray-800 leading-relaxed italic text-lg shadow-sm">
                        "{getNote() || "No additional notes provided."}"
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full py-20 text-center text-gray-300"
                  >
                    <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                      <Utensils className="w-16 h-16 opacity-20" />
                    </div>
                    <p className="font-black uppercase tracking-tighter text-xl text-gray-400">Waiting for Data</p>
                    <p className="text-gray-400 text-sm mt-2 max-w-[200px]">Upload and analyze a photo to see your report here.</p>
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
