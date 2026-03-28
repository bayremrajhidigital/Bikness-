import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Scale, Ruler, Calendar, Target, CheckCircle2, Info } from "lucide-react";
import { cn } from "../lib/utils";
import { GoogleGenAI, Type } from "@google/genai";

interface Plan {
  id: string;
  workoutPlan: { 
    phase: string; 
    days: { title: string; exercises: string[] }[] 
  }[];
  nutritionPlan: { calories: number; macros: { protein: number; carbs: number; fats: number } };
  tips: string[];
  createdAt: string;
}

export default function AIPlanner() {
  const { user } = useAuth();
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [workoutDays, setWorkoutDays] = useState("3");
  const [goal, setGoal] = useState("fat-loss");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchLatestPlan = async () => {
      try {
        const q = query(collection(db, "plans"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const plans = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Plan[];
        if (plans.length > 0) {
          setPlan(plans[plans.length - 1]);
        }
      } catch (err) {
        console.error("Error fetching latest plan:", err);
      }
    };

    fetchLatestPlan();
  }, [user]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError("");

    try {
      // Premium features are now free for everyone
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const prompt = `Generate a comprehensive 30-day workout and nutrition plan for a user with:
        Weight: ${weight}kg, Height: ${height}cm, Age: ${age}, Workout Days: ${workoutDays} days/week, Goal: ${goal}.
        The plan should be divided into 4 weekly phases (chapters).
        Each phase should have a specific focus (e.g., Foundation, Intensity, Strength, Peak).
        Include REAL exercises with sets and reps (e.g., "Bench Press: 3 sets of 10-12 reps").
        Provide a detailed nutrition plan with daily calorie targets and macros.
        Include 5-10 professional fitness tips.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              workoutPlan: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    phase: { type: Type.STRING, description: "Phase name (e.g., Week 1: Foundation)" },
                    days: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING, description: "Day title (e.g., Upper Body Focus)" },
                          exercises: { type: Type.ARRAY, items: { type: Type.STRING } },
                        },
                        required: ["title", "exercises"],
                      },
                    },
                  },
                  required: ["phase", "days"],
                },
              },
              nutritionPlan: {
                type: Type.OBJECT,
                properties: {
                  calories: { type: Type.NUMBER },
                  macros: {
                    type: Type.OBJECT,
                    properties: {
                      protein: { type: Type.NUMBER },
                      carbs: { type: Type.NUMBER },
                      fats: { type: Type.NUMBER },
                    },
                    required: ["protein", "carbs", "fats"],
                  },
                },
                required: ["calories", "macros"],
              },
              tips: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["workoutPlan", "nutritionPlan", "tips"],
          },
        },
      });

      const planData = JSON.parse(response.text);
      const newPlan = {
        ...planData,
        userId: user.uid,
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, "plans"), newPlan);
      setPlan({ id: docRef.id, ...newPlan });
    } catch (err: any) {
      console.error("[AIPlanner] Error generating plan:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <h1 className="text-4xl font-black tracking-tighter text-gray-900 mb-4 uppercase">
          AI WORKOUT <span className="text-orange-500 italic">PLANNER</span>
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Get a personalized 30-day workout and nutrition plan tailored to your body and goals.
        </p>
      </motion.div>

      {!plan ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
        >
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-orange-500" /> Weight (kg)
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="75"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-orange-500" /> Height (cm)
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="180"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-500" /> Age
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  placeholder="25"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Target className="w-4 h-4 text-orange-500" /> Goal
                </label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  <option value="fat-loss">Fat Loss</option>
                  <option value="muscle-gain">Muscle Gain</option>
                  <option value="strength">Strength</option>
                  <option value="endurance">Endurance</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Workout Days per Week</label>
              <div className="flex gap-2">
                {["2", "3", "4", "5", "6"].map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setWorkoutDays(day)}
                    className={cn(
                      "flex-1 py-3 rounded-xl font-bold transition-all",
                      workoutDays === day ? "bg-orange-500 text-white shadow-lg" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                <Info className="w-4 h-4" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold hover:bg-orange-600 transition-all flex items-center justify-center space-x-2 group disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5" />
              <span>{loading ? "Generating Your Plan..." : "Generate 30-Day Plan"}</span>
            </button>
          </form>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Nutrition Plan */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter">Nutrition Plan</h2>
                <div className="space-y-6">
                  <div className="bg-orange-50 p-6 rounded-2xl text-center">
                    <p className="text-sm text-orange-600 font-bold uppercase mb-1">Daily Calories</p>
                    <p className="text-4xl font-black text-orange-900">{plan.nutritionPlan.calories}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">Protein</p>
                      <p className="text-lg font-black">{plan.nutritionPlan.macros.protein}g</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">Carbs</p>
                      <p className="text-lg font-black">{plan.nutritionPlan.macros.carbs}g</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">Fats</p>
                      <p className="text-lg font-black">{plan.nutritionPlan.macros.fats}g</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter">AI Tips</h2>
                <div className="space-y-4">
                  {plan.tips.map((tip, i) => (
                    <div key={i} className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                      <p className="text-gray-600 text-sm">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Workout Plan */}
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-black mb-6 uppercase tracking-tighter">30-Day Workout Schedule</h2>
              <div className="space-y-8 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                {plan.workoutPlan.map((phase, phaseIdx) => (
                  <div key={phaseIdx} className="space-y-4">
                    <h3 className="text-xl font-black text-orange-600 uppercase tracking-tight flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-sm">
                        {phaseIdx + 1}
                      </div>
                      {phase.phase}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {phase.days.map((day, dayIdx) => (
                        <div key={dayIdx} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-orange-200 transition-colors">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-black text-orange-500 uppercase tracking-widest">Day {dayIdx + 1}</span>
                            <CheckCircle2 className="w-4 h-4 text-gray-300" />
                          </div>
                          <h4 className="font-bold text-gray-900 mb-3">{day.title}</h4>
                          <ul className="space-y-2">
                            {day.exercises.map((ex, j) => (
                              <li key={j} className="text-sm text-gray-600 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                                {ex}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <button
              onClick={() => setPlan(null)}
              className="text-orange-600 font-bold hover:underline"
            >
              Generate a different plan
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
