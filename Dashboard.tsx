import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { motion } from "motion/react";
import { Dumbbell, Sparkles, Users, TrendingUp, Trophy, ClipboardList, Calendar, Video, Camera, Utensils, User as UserIcon, ArrowRight, Zap, Medal } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [hasPlan, setHasPlan] = useState(false);
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);

  const fitnessTools = [
    {
      path: "/tools/trainer",
      title: "AI Trainer",
      desc: "24/7 chat support",
      icon: Sparkles,
      color: "bg-orange-500",
    },
    {
      path: "/tools/physique-analysis",
      title: "Physique",
      desc: "Body fat tracking",
      icon: Camera,
      color: "bg-purple-500",
    },
    {
      path: "/tools/food-analysis",
      title: "Food Analysis",
      desc: "Macro breakdown",
      icon: Utensils,
      color: "bg-green-500",
    },
    {
      path: "/workout",
      title: "Workout Tracker",
      desc: "Log your sessions",
      icon: Dumbbell,
      color: "bg-blue-500",
    },
  ];

  useEffect(() => {
    if (!user) return;

    // Fetch leaderboard
    const fetchLeaderboard = async () => {
      try {
        const q = query(collection(db, "users"), orderBy("points", "desc"), limit(5));
        const querySnapshot = await getDocs(q);
        const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLeaderboard(users);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      }
    };

    // Check if user has a plan
    const checkPlan = async () => {
      try {
        const q = query(collection(db, "plans"), where("userId", "==", user.uid), limit(1));
        const querySnapshot = await getDocs(q);
        setHasPlan(!querySnapshot.empty);
      } catch (err) {
        console.error("Error checking plan:", err);
      }
    };

    // Fetch recent workouts
    const fetchRecentWorkouts = async () => {
      try {
        const q = query(
          collection(db, "workouts"), 
          where("userId", "==", user.uid), 
          orderBy("createdAt", "desc"), 
          limit(3)
        );
        const querySnapshot = await getDocs(q);
        const workouts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecentWorkouts(workouts);
      } catch (err) {
        console.error("Error fetching recent workouts:", err);
      }
    };

    fetchLeaderboard();
    checkPlan();
    fetchRecentWorkouts();
  }, [user]);

  const stats = [
    { label: "Workouts", value: recentWorkouts.length.toString(), icon: Dumbbell, color: "bg-blue-500" },
    { label: "Points", value: (user?.points || 0).toString(), icon: Trophy, color: "bg-yellow-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-4xl font-black tracking-tighter text-gray-900 uppercase">
          HELLO, <span className="text-orange-500">{user?.name}</span>!
        </h1>
        <p className="text-gray-600 mt-2">Ready for today's session? Let's crush those goals.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4"
          >
            <div className={`${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black flex items-center space-x-2 tracking-tighter uppercase">
              <Sparkles className="text-orange-500 w-6 h-6" />
              <span>Your AI Plan</span>
            </h2>
            <Link to="/ai-plan" className="text-orange-600 font-bold hover:underline">View Plan</Link>
          </div>
          <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 h-[calc(100%-4rem)] flex flex-col justify-center">
            {hasPlan ? (
              <>
                <p className="text-orange-900 font-black uppercase tracking-tight mb-2">Active Phase-Based Plan</p>
                <p className="text-orange-700 text-sm mb-4">Your personalized 4-week transformation journey is ready. Keep pushing your limits!</p>
                <Link
                  to="/ai-plan"
                  className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all inline-block shadow-lg shadow-orange-200 text-center"
                >
                  Continue Workout
                </Link>
              </>
            ) : (
              <>
                <p className="text-orange-900 font-black uppercase tracking-tight mb-2">No Plan Yet</p>
                <p className="text-orange-700 text-sm mb-4">Generate your first AI-powered 30-day workout and nutrition plan to start your journey.</p>
                <Link
                  to="/ai-plan"
                  className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all inline-block shadow-lg shadow-orange-200 text-center"
                >
                  Generate AI Plan
                </Link>
              </>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center space-x-2 uppercase tracking-tighter">
              <ClipboardList className="text-orange-500 w-6 h-6" />
              <span>Recent Workouts</span>
            </h2>
            <Link to="/workout" className="text-orange-600 font-bold hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {recentWorkouts.length > 0 ? (
              recentWorkouts.map((workout) => (
                <div key={workout.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-orange-500" />
                      {new Date(workout.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-xs font-black text-gray-400 uppercase">{workout.exercises.length} Exercises</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {workout.exercises.slice(0, 3).map((ex: any) => (
                      <span key={ex.id} className="text-[10px] font-bold px-2 py-1 bg-white border border-gray-200 rounded-lg text-gray-600">
                        {ex.name}
                      </span>
                    ))}
                    {workout.exercises.length > 3 && (
                      <span className="text-[10px] font-bold px-2 py-1 text-gray-400">+{workout.exercises.length - 3} more</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No recent workouts logged.</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center space-x-2 uppercase tracking-tighter">
              <Medal className="text-yellow-500 w-6 h-6" />
              <span>Leaderboard</span>
            </h2>
            <Link to="/leaderboard" className="text-blue-600 font-bold hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {leaderboard.length > 0 ? (
              leaderboard.map((lbUser, i) => (
                <div key={lbUser.id} className={`flex items-center justify-between p-4 rounded-2xl ${lbUser.id === user?.uid ? 'bg-yellow-50 border border-yellow-100' : 'bg-gray-50'}`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${i === 0 ? 'bg-yellow-400 text-white' : i === 1 ? 'bg-gray-300 text-white' : i === 2 ? 'bg-orange-300 text-white' : 'bg-gray-200 text-gray-500'}`}>
                      {i + 1}
                    </div>
                    <p className="text-sm font-bold truncate max-w-[120px]">{lbUser.name}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-black text-gray-900">{lbUser.points || 0}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">pts</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No rankings available yet.</p>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black tracking-tighter uppercase flex items-center gap-2">
            <Zap className="text-orange-500 w-6 h-6" />
            <span>Fitness Tools</span>
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {fitnessTools.map((tool, i) => (
            <Link
              key={i}
              to={tool.path}
              className="block"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm group cursor-pointer h-full"
              >
                <div className={`${tool.color} w-10 h-10 rounded-xl flex items-center justify-center text-white mb-4 group-hover:rotate-6 transition-transform`}>
                  <tool.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm mb-1">{tool.title}</h3>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{tool.desc}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
