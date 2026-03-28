import React, { createContext, useContext, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { db } from "../firebase";
import { collection, addDoc, doc, updateDoc, increment } from "firebase/firestore";

interface LoggedSet {
  reps: number;
  weight: number;
}

interface LoggedExercise {
  id: string;
  name: string;
  sets: LoggedSet[];
}

interface WorkoutContextType {
  currentWorkout: LoggedExercise[];
  addExerciseToWorkout: (exercise: { id: string; name: string }) => void;
  updateSet: (exerciseId: string, setIndex: number, reps: number, weight: number) => void;
  addSet: (exerciseId: string) => void;
  removeSet: (exerciseId: string, setIndex: number) => void;
  removeExercise: (exerciseId: string) => void;
  clearWorkout: () => void;
  saveWorkout: () => Promise<void>;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const { user, refreshUser } = useAuth();
  const [currentWorkout, setCurrentWorkout] = useState<LoggedExercise[]>([]);

  const addExerciseToWorkout = (exercise: { id: string; name: string }) => {
    setCurrentWorkout((prev) => {
      if (prev.find((ex) => ex.id === exercise.id)) return prev;
      return [...prev, { ...exercise, sets: [{ reps: 0, weight: 0 }] }];
    });
  };

  const updateSet = (exerciseId: string, setIndex: number, reps: number, weight: number) => {
    setCurrentWorkout((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((s, i) => (i === setIndex ? { reps, weight } : s)),
            }
          : ex
      )
    );
  };

  const addSet = (exerciseId: string) => {
    setCurrentWorkout((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, sets: [...ex.sets, { reps: 0, weight: 0 }] }
          : ex
      )
    );
  };

  const removeSet = (exerciseId: string, setIndex: number) => {
    setCurrentWorkout((prev) =>
      prev.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, sets: ex.sets.filter((_, i) => i !== setIndex) }
          : ex
      )
    );
  };

  const removeExercise = (exerciseId: string) => {
    setCurrentWorkout((prev) => prev.filter((ex) => ex.id !== exerciseId));
  };

  const clearWorkout = () => setCurrentWorkout([]);

  const saveWorkout = async () => {
    if (currentWorkout.length === 0 || !user) return;

    try {
      const workoutData = {
        userId: user.uid,
        exercises: currentWorkout,
        createdAt: Date.now()
      };

      await addDoc(collection(db, "workouts"), workoutData);
      
      // Increment user points (50 points per workout)
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        points: increment(50)
      });

      await refreshUser();
      clearWorkout();
    } catch (error) {
      console.error("Error saving workout:", error);
      throw error;
    }
  };

  return (
    <WorkoutContext.Provider
      value={{
        currentWorkout,
        addExerciseToWorkout,
        updateSet,
        addSet,
        removeSet,
        removeExercise,
        clearWorkout,
        saveWorkout,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
}
