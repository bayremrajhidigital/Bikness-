import React, { useState, useEffect } from "react";
import { useWorkout } from "../context/WorkoutContext";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import { ClipboardList, Plus, Trash2, Save, History, Dumbbell, Calendar, X } from "lucide-react";
import { cn } from "../lib/utils";
import { Link } from "react-router-dom";

export default function WorkoutTracker() {
  const { user } = useAuth();
  const {
    currentWorkout,
    updateSet,
    addSet,
    removeSet,
    removeExercise,
    saveWorkout,
    clearWorkout,
  } = useWorkout();

  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"current" | "history">("current");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (activeTab === "history" && user) {
      fetchHistory();
    }
  }, [activeTab, user]);

  const fetchHistory = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, "workouts"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistory(data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveWorkout();
      setActiveTab("history");
    } catch (error) {
      alert("Failed to save workout");
    } finally {
      setSaving(false);
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
          WORKOUT <span className="text-orange-500 italic">TRACKER</span>
        </h1>
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => setActiveTab("current")}
            className={cn(
              "px-6 py-2 rounded-full font-bold transition-all flex items-center gap-2",
              activeTab === "current" ? "bg-orange-500 text-white shadow-lg" : "bg-white text-gray-600 border border-gray-200"
            )}
          >
            <ClipboardList className="w-4 h-4" />
            Current Session
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "px-6 py-2 rounded-full font-bold transition-all flex items-center gap-2",
              activeTab === "history" ? "bg-orange-500 text-white shadow-lg" : "bg-white text-gray-600 border border-gray-200"
            )}
          >
            <History className="w-4 h-4" />
            History
          </button>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === "current" ? (
          <motion.div
            key="current"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            {currentWorkout.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center">
                <Dumbbell className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No exercises added</h2>
                <p className="text-gray-500 mb-6">Go to the Exercise Library to add exercises to your session.</p>
                <Link
                  to="/exercises"
                  className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all inline-block"
                >
                  Go to Library
                </Link>
              </div>
            ) : (
              <>
                {currentWorkout.map((ex) => (
                  <div key={ex.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="text-xl font-black uppercase tracking-tight">{ex.name}</h3>
                      <button
                        onClick={() => removeExercise(ex.id)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-12 gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest px-4">
                        <div className="col-span-2">Set</div>
                        <div className="col-span-4">Weight (kg)</div>
                        <div className="col-span-4">Reps</div>
                        <div className="col-span-2"></div>
                      </div>
                      {ex.sets.map((set, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-4 items-center bg-gray-50 p-4 rounded-2xl">
                          <div className="col-span-2 font-black text-gray-900">{idx + 1}</div>
                          <div className="col-span-4">
                            <input
                              type="number"
                              value={set.weight || ""}
                              onChange={(e) => updateSet(ex.id, idx, set.reps, parseFloat(e.target.value) || 0)}
                              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                              placeholder="0"
                            />
                          </div>
                          <div className="col-span-4">
                            <input
                              type="number"
                              value={set.reps || ""}
                              onChange={(e) => updateSet(ex.id, idx, parseInt(e.target.value) || 0, set.weight)}
                              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-orange-500 outline-none"
                              placeholder="0"
                            />
                          </div>
                          <div className="col-span-2 flex justify-end">
                            <button
                              onClick={() => removeSet(ex.id, idx)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => addSet(ex.id)}
                        className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 font-bold hover:border-orange-500 hover:text-orange-500 transition-all flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Set
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex gap-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 bg-orange-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {saving ? "Saving..." : "Finish & Save Workout"}
                  </button>
                  <button
                    onClick={clearWorkout}
                    className="px-8 bg-white text-gray-600 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                  >
                    Clear
                  </button>
                </div>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            {history.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center">
                <History className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No workout history</h2>
                <p className="text-gray-500">Complete your first workout to see it here!</p>
              </div>
            ) : (
              history.map((workout) => (
                <div key={workout.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center gap-2 text-orange-500 font-bold mb-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(workout.createdAt).toLocaleDateString(undefined, {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <h3 className="text-2xl font-black uppercase tracking-tighter">
                        {workout.exercises.length} Exercises Completed
                      </h3>
                    </div>
                    <div className="bg-gray-100 px-4 py-2 rounded-xl text-sm font-bold text-gray-600">
                      {new Date(workout.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {workout.exercises.map((ex: any) => (
                      <div key={ex.id} className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <h4 className="font-bold text-gray-900 mb-3 uppercase tracking-tight">{ex.name}</h4>
                        <div className="space-y-2">
                          {ex.sets.map((set: any, i: number) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-gray-500 font-medium">Set {i + 1}</span>
                              <span className="font-bold">{set.weight}kg × {set.reps} reps</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
