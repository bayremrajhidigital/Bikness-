import * as React from "react";
import { HashRouter as Router, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { WorkoutProvider } from "./context/WorkoutContext";
import { Dumbbell, LayoutDashboard, Users, Sparkles, LogOut, Menu, X, ClipboardList } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import AuthPage from "./components/Auth";
import Dashboard from "./components/Dashboard";
import ExerciseLibrary from "./components/ExerciseLibrary";
import AIPlanner from "./components/AIPlanner";
import Community from "./components/Community";
import WorkoutTracker from "./components/WorkoutTracker";
import AITrainer from "./components/tools/AITrainer";
import FoodAnalysis from "./components/tools/FoodAnalysis";
import PhysiqueAnalysis from "./components/tools/PhysiqueAnalysis";
import { cn } from "./lib/utils";
import { db } from "./firebase";
import { collection, getCountFromServer } from "firebase/firestore";

function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Exercises", path: "/exercises", icon: Dumbbell },
    { name: "Workout", path: "/workout", icon: ClipboardList },
    { name: "AI Plan", path: "/ai-plan", icon: Sparkles },
    { name: "Community", path: "/community", icon: Users },
  ];

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Dumbbell className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-gray-900">BEKNAES</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      location.pathname === item.path
                        ? "bg-orange-500 text-white"
                        : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="bg-orange-500 text-white px-6 py-2 rounded-full font-bold hover:bg-orange-600 transition-colors"
              >
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-orange-500 hover:bg-orange-50"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-200 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-3 space-y-1">
              {user ? (
                <>
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center space-x-2 px-3 py-3 rounded-lg text-base font-medium",
                        location.pathname === item.path
                          ? "bg-orange-500 text-white"
                          : "text-gray-600 hover:bg-orange-50"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center bg-orange-500 text-white px-6 py-3 rounded-xl font-bold"
                >
                  Get Started
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  return user ? <>{children}</> : null;
}

function LandingPage() {
  const [memberCount, setMemberCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    const fetchCount = async () => {
      try {
        const coll = collection(db, "users");
        const snapshot = await getCountFromServer(coll);
        setMemberCount(snapshot.data().count);
      } catch (err) {
        console.error("Error fetching member count:", err);
      }
    };
    fetchCount();
  }, []);

  return (
    <div className="pt-20">
      <section className="px-4 py-20 max-w-7xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl md:text-8xl font-black tracking-tighter text-gray-900 mb-6 uppercase"
        >
          TRANSFORM YOUR <span className="text-orange-500 italic">BODY</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-gray-600 max-w-2xl mx-auto mb-6"
        >
          beknaes is your all-in-one fitness companion. AI-powered plans, massive exercise library, and a community of warriors.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex items-center justify-center gap-2 mb-10"
        >
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <img
                key={i}
                src={`https://picsum.photos/seed/user${i}/100/100`}
                alt="user"
                className="w-10 h-10 rounded-full border-2 border-white"
                referrerPolicy="no-referrer"
              />
            ))}
          </div>
          <p className="text-sm font-bold text-gray-600">
            Joined by <span className="text-orange-500">{memberCount ? `${memberCount.toLocaleString()}+` : "10,000+"} members</span>
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Link
            to="/auth"
            className="bg-orange-500 text-white px-10 py-4 rounded-full text-xl font-bold hover:bg-orange-600 hover:scale-105 transition-all inline-block shadow-lg shadow-orange-500/20"
          >
            Start Your Journey
          </Link>
        </motion.div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "AI Planner", desc: "Get a personalized 30-day workout and nutrition plan in seconds.", icon: Sparkles },
            { title: "150+ Exercises", desc: "Detailed videos and guides for bodyweight and gym workouts.", icon: Dumbbell },
            { title: "Community", desc: "Share your progress and get inspired by others.", icon: Users },
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <feature.icon className="text-orange-600 w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WorkoutProvider>
        <Router>
          <div className="min-h-screen bg-white text-gray-900 font-sans">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/exercises" element={<PrivateRoute><ExerciseLibrary /></PrivateRoute>} />
                <Route path="/workout" element={<PrivateRoute><WorkoutTracker /></PrivateRoute>} />
                <Route path="/ai-plan" element={<PrivateRoute><AIPlanner /></PrivateRoute>} />
                <Route path="/community" element={<PrivateRoute><Community /></PrivateRoute>} />
                <Route path="/tools/trainer" element={<PrivateRoute><AITrainer /></PrivateRoute>} />
                <Route path="/tools/food-analysis" element={<PrivateRoute><FoodAnalysis /></PrivateRoute>} />
                <Route path="/tools/physique-analysis" element={<PrivateRoute><PhysiqueAnalysis /></PrivateRoute>} />
              </Routes>
            </main>
          </div>
        </Router>
      </WorkoutProvider>
    </AuthProvider>
  );
}
