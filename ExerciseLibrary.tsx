import React, { useState } from "react";
import { exercises, Exercise } from "../data/exercises";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, Dumbbell, Plus, CheckCircle2 } from "lucide-react";
import { cn } from "../lib/utils";
import { useWorkout } from "../context/WorkoutContext";

export default function ExerciseLibrary() {
  const [category, setCategory] = useState<"bodyweight" | "gym">("bodyweight");
  const [search, setSearch] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const { addExerciseToWorkout } = useWorkout();
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  const filteredExercises = exercises.filter(
    (ex) => ex.category === category && ex.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddToWorkout = (ex: Exercise) => {
    addExerciseToWorkout({ id: ex.id, name: ex.name });
    setAddedMessage(`Added ${ex.name} to workout!`);
    setTimeout(() => setAddedMessage(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <h1 className="text-4xl font-black tracking-tighter text-gray-900 mb-4 uppercase">
          EXERCISE <span className="text-orange-500 italic">LIBRARY</span>
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore over 150 exercises with detailed videos and step-by-step instructions.
        </p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-6 mb-10 items-center justify-between">
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 w-full md:w-auto">
          <button
            onClick={() => setCategory("bodyweight")}
            className={cn(
              "flex-1 md:flex-none px-8 py-3 rounded-xl font-bold transition-all",
              category === "bodyweight" ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-gray-600 hover:bg-gray-50"
            )}
          >
            Bodyweight
          </button>
          <button
            onClick={() => setCategory("gym")}
            className={cn(
              "flex-1 md:flex-none px-8 py-3 rounded-xl font-bold transition-all",
              category === "gym" ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-gray-600 hover:bg-gray-50"
            )}
          >
            Gym
          </button>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-20">
        <AnimatePresence mode="popLayout">
          {filteredExercises.map((ex, i) => (
            <motion.div
              key={ex.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedExercise(ex)}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 group cursor-pointer hover:shadow-xl transition-all p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                  <Dumbbell className="w-6 h-6" />
                </div>
                <div className="bg-gray-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-gray-400">
                  {ex.category}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-orange-500 transition-colors leading-tight">{ex.name}</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {ex.muscles.map((m) => (
                  <span key={m} className="text-[10px] font-black uppercase tracking-wider px-2 py-1 bg-gray-100 text-gray-500 rounded-lg">
                    {m.split(' ')[0]}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                {ex.description}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Exercise Modal */}
      <AnimatePresence>
        {selectedExercise && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setSelectedExercise(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedExercise(null)}
                className="absolute top-6 right-6 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-200 transition-all z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="p-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-orange-500 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                    <Dumbbell className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-orange-500 uppercase tracking-widest mb-1">{selectedExercise.category}</div>
                    <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">{selectedExercise.name}</h2>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Target Muscles</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedExercise.muscles.map((m) => (
                        <span key={m} className="px-4 py-2 bg-gray-100 text-gray-900 rounded-xl font-bold text-sm">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Instructions</h4>
                    <p className="text-gray-600 text-xl leading-relaxed font-medium">
                      {selectedExercise.description}
                    </p>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => handleAddToWorkout(selectedExercise)}
                      className="flex-1 bg-orange-500 text-white py-5 rounded-2xl font-black hover:bg-orange-600 transition-all uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-orange-500/20"
                    >
                      <Plus className="w-6 h-6" />
                      Add to Workout
                    </button>
                    <button
                      onClick={() => setSelectedExercise(null)}
                      className="px-8 bg-gray-100 text-gray-600 py-5 rounded-2xl font-black hover:bg-gray-200 transition-all uppercase tracking-widest"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {addedMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full font-bold shadow-2xl z-[110] flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            {addedMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
