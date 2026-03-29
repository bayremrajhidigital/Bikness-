// State management
const state = {
    user: null,
    loading: true,
    currentPath: window.location.hash.slice(1) || '/',
    memberCount: 0,
    posts: [],
    exercises: [],
    workouts: [],
    plans: [],
    aiPlan: null,
    error: null
};

// Icons initialization
const initIcons = () => {
    if (window.lucide) {
        window.lucide.createIcons();
    }
};

// Navigation
const navigate = (path) => {
    window.location.hash = path;
};

// Auth listener
window.firebase.onAuthStateChanged(window.firebase.auth, (user) => {
    state.user = user;
    state.loading = false;
    render();
});

// Router
window.addEventListener('hashchange', () => {
    state.currentPath = window.location.hash.slice(1) || '/';
    render();
});

// Components
const Navbar = () => {
    const navItems = [
        { name: "Dashboard", path: "/dashboard", icon: "layout-dashboard" },
        { name: "Exercises", path: "/exercises", icon: "dumbbell" },
        { name: "Workout", path: "/workout", icon: "clipboard-list" },
        { name: "AI Plan", path: "/ai-plan", icon: "sparkles" },
        { name: "Community", path: "/community", icon: "users" },
    ];

    const desktopNav = document.getElementById('desktop-nav');
    const mobileNavItems = document.getElementById('mobile-nav-items');

    if (state.user) {
        const itemsHtml = navItems.map(item => `
            <a href="#${item.path}" class="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${state.currentPath === item.path ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'}">
                <i data-lucide="${item.icon}" class="w-4 h-4"></i>
                <span>${item.name}</span>
            </a>
        `).join('');

        desktopNav.innerHTML = `
            ${itemsHtml}
            <button onclick="logout()" class="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors">
                <i data-lucide="log-out" class="w-4 h-4"></i>
                <span>Logout</span>
            </button>
        `;

        mobileNavItems.innerHTML = `
            ${navItems.map(item => `
                <a href="#${item.path}" class="flex items-center space-x-2 px-3 py-3 rounded-lg text-base font-medium ${state.currentPath === item.path ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-orange-50'}">
                    <i data-lucide="${item.icon}" class="w-5 h-5"></i>
                    <span>${item.name}</span>
                </a>
            `).join('')}
            <button onclick="logout()" class="w-full flex items-center space-x-2 px-3 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50">
                <i data-lucide="log-out" class="w-5 h-5"></i>
                <span>Logout</span>
            </button>
        `;
    } else {
        desktopNav.innerHTML = `
            <a href="#/auth" class="bg-orange-500 text-white px-6 py-2 rounded-full font-bold hover:bg-orange-600 transition-colors">
                Get Started
            </a>
        `;
        mobileNavItems.innerHTML = `
            <a href="#/auth" class="block w-full text-center bg-orange-500 text-white px-6 py-3 rounded-xl font-bold">
                Get Started
            </a>
        `;
    }
    initIcons();
};

// Global logout function
window.logout = () => {
    window.firebase.signOut(window.firebase.auth).then(() => {
        navigate('/auth');
    });
};

// Views
const LandingPage = async () => {
    if (state.memberCount === 0) {
        const coll = window.firebase.collection(window.firebase.db, "users");
        const snapshot = await window.firebase.getCountFromServer(coll);
        state.memberCount = snapshot.data().count;
    }

    return `
        <div class="pt-20 fade-in">
            <section class="px-4 py-20 max-w-7xl mx-auto text-center">
                <h1 class="text-6xl md:text-8xl font-black tracking-tighter text-gray-900 mb-6 uppercase">
                    TRANSFORM YOUR <span class="text-orange-500 italic">BODY</span>
                </h1>
                <p class="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
                    bikness is your all-in-one fitness companion. AI-powered plans, massive exercise library, and a community of warriors.
                </p>
                <div class="flex items-center justify-center gap-2 mb-10">
                    <div class="flex -space-x-2">
                        ${[1, 2, 3, 4].map(i => `
                            <img src="https://picsum.photos/seed/user${i}/100/100" alt="user" class="w-10 h-10 rounded-full border-2 border-white" referrerPolicy="no-referrer">
                        `).join('')}
                    </div>
                    <p class="text-sm font-bold text-gray-600">
                        Joined by <span class="text-orange-500">${state.memberCount > 0 ? `${state.memberCount.toLocaleString()}+` : "10,000+"} members</span>
                    </p>
                </div>
                <div>
                    <a href="#/auth" class="bg-orange-500 text-white px-10 py-4 rounded-full text-xl font-bold hover:bg-orange-600 hover:scale-105 transition-all inline-block shadow-lg shadow-orange-500/20">
                        Start Your Journey
                    </a>
                </div>
            </section>

            <section class="bg-gray-50 py-20">
                <div class="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
                    ${[
                        { title: "AI Planner", desc: "Get a personalized 30-day workout and nutrition plan in seconds.", icon: "sparkles" },
                        { title: "150+ Exercises", desc: "Detailed videos and guides for bodyweight and gym workouts.", icon: "dumbbell" },
                        { title: "Community", desc: "Share your progress and get inspired by others.", icon: "users" },
                    ].map(feature => `
                        <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:-translate-y-2 transition-transform">
                            <div class="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                                <i data-lucide="${feature.icon}" class="text-orange-600 w-6 h-6"></i>
                            </div>
                            <h3 class="text-2xl font-bold mb-4">${feature.title}</h3>
                            <p class="text-gray-600">${feature.desc}</p>
                        </div>
                    `).join('')}
                </div>
            </section>
        </div>
    `;
};

const AuthPage = () => {
    // This will be handled by a separate function to manage form state
    return `
        <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 fade-in">
            <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
                <div class="text-center">
                    <div class="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <i data-lucide="dumbbell" class="text-white w-10 h-10"></i>
                    </div>
                    <h2 id="auth-title" class="text-3xl font-black tracking-tighter text-gray-900 uppercase">Welcome Back</h2>
                    <p id="auth-subtitle" class="mt-2 text-sm text-gray-600">Login to your warrior account</p>
                </div>

                <form id="auth-form" class="mt-8 space-y-6">
                    <div class="space-y-4">
                        <div id="name-field" class="hidden">
                            <label class="text-sm font-bold text-gray-700">Full Name</label>
                            <input id="auth-name" type="text" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" placeholder="John Doe">
                        </div>
                        <div>
                            <label class="text-sm font-bold text-gray-700">Email Address</label>
                            <input id="auth-email" type="email" required class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" placeholder="warrior@example.com">
                        </div>
                        <div>
                            <label class="text-sm font-bold text-gray-700">Password</label>
                            <input id="auth-password" type="password" required class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" placeholder="••••••••">
                        </div>
                    </div>

                    <div id="auth-error" class="hidden text-red-500 text-sm text-center"></div>

                    <button type="submit" id="auth-submit" class="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20">
                        Login
                    </button>

                    <div class="relative">
                        <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-200"></div></div>
                        <div class="relative flex justify-center text-sm"><span class="px-2 bg-white text-gray-500">Or continue with</span></div>
                    </div>

                    <button type="button" onclick="loginWithGoogle()" class="w-full bg-white border border-gray-200 text-gray-700 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center space-x-2">
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" class="w-5 h-5" alt="Google">
                        <span>Google</span>
                    </button>

                    <p class="text-center text-sm text-gray-600">
                        <span id="auth-switch-text">Don't have an account?</span>
                        <button type="button" onclick="toggleAuthMode()" id="auth-switch-btn" class="text-orange-500 font-bold hover:underline ml-1">Sign Up</button>
                    </p>
                </form>
            </div>
        </div>
    `;
};

// Auth logic
let isLogin = true;
window.toggleAuthMode = () => {
    isLogin = !isLogin;
    const title = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');
    const nameField = document.getElementById('name-field');
    const submitBtn = document.getElementById('auth-submit');
    const switchText = document.getElementById('auth-switch-text');
    const switchBtn = document.getElementById('auth-switch-btn');

    if (isLogin) {
        title.innerText = 'Welcome Back';
        subtitle.innerText = 'Login to your warrior account';
        nameField.classList.add('hidden');
        submitBtn.innerText = 'Login';
        switchText.innerText = "Don't have an account?";
        switchBtn.innerText = 'Sign Up';
    } else {
        title.innerText = 'Join the Tribe';
        subtitle.innerText = 'Start your transformation today';
        nameField.classList.remove('hidden');
        submitBtn.innerText = 'Create Account';
        switchText.innerText = 'Already have an account?';
        switchBtn.innerText = 'Login';
    }
};

window.loginWithGoogle = () => {
    window.firebase.signInWithPopup(window.firebase.auth, window.firebase.googleProvider)
        .then(() => navigate('/dashboard'))
        .catch(err => {
            document.getElementById('auth-error').innerText = err.message;
            document.getElementById('auth-error').classList.remove('hidden');
        });
};

const Dashboard = async () => {
    if (!state.user) return '';

    const workoutsQuery = window.firebase.query(
        window.firebase.collection(window.firebase.db, "workouts"),
        window.firebase.where("userId", "==", state.user.uid),
        window.firebase.orderBy("createdAt", "desc"),
        window.firebase.limit(5)
    );
    const workoutsSnapshot = await window.firebase.getDocs(workoutsQuery);
    state.workouts = workoutsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const totalWorkouts = state.workouts.length;
    const lastWorkout = state.workouts[0];

    return `
        <div class="min-h-screen bg-gray-50 pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20 fade-in">
            <div class="mb-10">
                <h1 class="text-4xl font-black tracking-tighter text-gray-900 uppercase">
                    Welcome back, <span class="text-orange-500 italic">${state.user.displayName || 'Warrior'}</span>
                </h1>
                <p class="text-gray-600">Your transformation continues today.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                            <i data-lucide="dumbbell" class="text-orange-600 w-6 h-6"></i>
                        </div>
                        <span class="text-xs font-bold text-gray-400 uppercase">Total Workouts</span>
                    </div>
                    <p class="text-4xl font-black text-gray-900">${totalWorkouts}</p>
                </div>
                <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                            <i data-lucide="calendar" class="text-green-600 w-6 h-6"></i>
                        </div>
                        <span class="text-xs font-bold text-gray-400 uppercase">Last Session</span>
                    </div>
                    <p class="text-xl font-bold text-gray-900">${lastWorkout ? new Date(lastWorkout.createdAt).toLocaleDateString() : 'No sessions yet'}</p>
                </div>
                <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                            <i data-lucide="target" class="text-blue-600 w-6 h-6"></i>
                        </div>
                        <span class="text-xs font-bold text-gray-400 uppercase">Current Goal</span>
                    </div>
                    <p class="text-xl font-bold text-gray-900">Muscle Gain</p>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h2 class="text-2xl font-black mb-6 uppercase tracking-tighter">Recent Activity</h2>
                    <div class="space-y-4">
                        ${state.workouts.length > 0 ? state.workouts.map(w => `
                            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div>
                                    <p class="font-bold text-gray-900">${w.type || 'Workout'}</p>
                                    <p class="text-sm text-gray-500">${new Date(w.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div class="text-right">
                                    <p class="font-black text-orange-500">${w.duration || 0} min</p>
                                    <p class="text-xs text-gray-400 uppercase">${w.exercises?.length || 0} exercises</p>
                                </div>
                            </div>
                        `).join('') : '<p class="text-gray-500 text-center py-10">No recent activity. Start your first workout!</p>'}
                    </div>
                </div>

                <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h2 class="text-2xl font-black mb-6 uppercase tracking-tighter">Quick Tools</h2>
                    <div class="grid grid-cols-2 gap-4">
                        <a href="#/ai-plan" class="p-6 bg-orange-50 rounded-2xl border border-orange-100 hover:bg-orange-100 transition-colors group">
                            <i data-lucide="sparkles" class="text-orange-600 w-8 h-8 mb-4 group-hover:scale-110 transition-transform"></i>
                            <h3 class="font-bold text-orange-900">AI Planner</h3>
                            <p class="text-xs text-orange-600 mt-1">Generate new plan</p>
                        </a>
                        <a href="#/workout" class="p-6 bg-blue-50 rounded-2xl border border-blue-100 hover:bg-blue-100 transition-colors group">
                            <i data-lucide="clipboard-list" class="text-blue-600 w-8 h-8 mb-4 group-hover:scale-110 transition-transform"></i>
                            <h3 class="font-bold text-blue-900">Log Workout</h3>
                            <p class="text-xs text-blue-600 mt-1">Track your progress</p>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
};

const ExerciseLibrary = () => {
    const exercises = [
        { name: "Push Ups", category: "Chest", difficulty: "Beginner", image: "https://picsum.photos/seed/pushups/400/300" },
        { name: "Squats", category: "Legs", difficulty: "Beginner", image: "https://picsum.photos/seed/squats/400/300" },
        { name: "Pull Ups", category: "Back", difficulty: "Intermediate", image: "https://picsum.photos/seed/pullups/400/300" },
        { name: "Deadlifts", category: "Full Body", difficulty: "Advanced", image: "https://picsum.photos/seed/deadlifts/400/300" },
        { name: "Plank", category: "Core", difficulty: "Beginner", image: "https://picsum.photos/seed/plank/400/300" },
        { name: "Bench Press", category: "Chest", difficulty: "Intermediate", image: "https://picsum.photos/seed/bench/400/300" },
    ];

    return `
        <div class="min-h-screen bg-gray-50 pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20 fade-in">
            <div class="mb-10 text-center">
                <h1 class="text-4xl font-black tracking-tighter text-gray-900 mb-4 uppercase">
                    EXERCISE <span class="text-orange-500 italic">LIBRARY</span>
                </h1>
                <p class="text-gray-600 max-w-2xl mx-auto">Master your form with our comprehensive guide to over 150 exercises.</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                ${exercises.map(ex => `
                    <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all">
                        <div class="relative h-48 overflow-hidden">
                            <img src="${ex.image}" alt="${ex.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer">
                            <div class="absolute top-4 left-4">
                                <span class="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-orange-600 uppercase tracking-widest">${ex.category}</span>
                            </div>
                        </div>
                        <div class="p-6">
                            <div class="flex justify-between items-start mb-2">
                                <h3 class="text-xl font-bold text-gray-900">${ex.name}</h3>
                                <span class="text-xs font-bold text-gray-400 uppercase">${ex.difficulty}</span>
                            </div>
                            <p class="text-gray-500 text-sm mb-6">Master the perfect form for maximum results and safety.</p>
                            <button class="w-full py-3 bg-gray-50 text-gray-900 font-bold rounded-xl hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-2">
                                <i data-lucide="play-circle" class="w-4 h-4"></i>
                                View Guide
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
};

const AIPlan = async () => {
    if (!state.user) return '';

    if (!state.aiPlan) {
        const q = window.firebase.query(
            window.firebase.collection(window.firebase.db, "plans"),
            window.firebase.where("userId", "==", state.user.uid),
            window.firebase.orderBy("createdAt", "desc"),
            window.firebase.limit(1)
        );
        const snapshot = await window.firebase.getDocs(q);
        if (!snapshot.empty) {
            state.aiPlan = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
        }
    }

    if (!state.aiPlan) {
        return `
            <div class="min-h-screen bg-gray-50 pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20 fade-in">
                <div class="mb-10 text-center">
                    <h1 class="text-4xl font-black tracking-tighter text-gray-900 mb-4 uppercase">
                        AI WORKOUT <span class="text-orange-500 italic">PLANNER</span>
                    </h1>
                    <p class="text-gray-600 max-w-2xl mx-auto">Get a personalized 30-day workout and nutrition plan tailored to your body and goals.</p>
                </div>

                <div class="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                    <form id="ai-plan-form" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="space-y-2">
                                <label class="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <i data-lucide="scale" class="w-4 h-4 text-orange-500"></i> Weight (kg)
                                </label>
                                <input id="ai-weight" type="number" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" placeholder="75" required>
                            </div>
                            <div class="space-y-2">
                                <label class="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <i data-lucide="ruler" class="w-4 h-4 text-orange-500"></i> Height (cm)
                                </label>
                                <input id="ai-height" type="number" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" placeholder="180" required>
                            </div>
                            <div class="space-y-2">
                                <label class="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <i data-lucide="calendar" class="w-4 h-4 text-orange-500"></i> Age
                                </label>
                                <input id="ai-age" type="number" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" placeholder="25" required>
                            </div>
                            <div class="space-y-2">
                                <label class="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <i data-lucide="target" class="w-4 h-4 text-orange-500"></i> Goal
                                </label>
                                <select id="ai-goal" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none">
                                    <option value="fat-loss">Fat Loss</option>
                                    <option value="muscle-gain">Muscle Gain</option>
                                    <option value="strength">Strength</option>
                                    <option value="endurance">Endurance</option>
                                </select>
                            </div>
                        </div>

                        <button type="submit" id="ai-generate-btn" class="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold hover:bg-orange-600 transition-all flex items-center justify-center space-x-2 group">
                            <i data-lucide="sparkles" class="w-5 h-5"></i>
                            <span>Generate 30-Day Plan</span>
                        </button>
                    </form>
                </div>
            </div>
        `;
    }

    const plan = state.aiPlan;
    return `
        <div class="min-h-screen bg-gray-50 pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-20 fade-in">
            <div class="mb-10 text-center">
                <h1 class="text-4xl font-black tracking-tighter text-gray-900 mb-4 uppercase">
                    YOUR AI <span class="text-orange-500 italic">PLAN</span>
                </h1>
                <p class="text-gray-600 max-w-2xl mx-auto">Your personalized 30-day journey is ready.</p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div class="lg:col-span-1 space-y-6">
                    <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h2 class="text-2xl font-black mb-6 uppercase tracking-tighter">Nutrition</h2>
                        <div class="space-y-6">
                            <div class="bg-orange-50 p-6 rounded-2xl text-center">
                                <p class="text-sm text-orange-600 font-bold uppercase mb-1">Daily Calories</p>
                                <p class="text-4xl font-black text-orange-900">${plan.nutritionPlan.calories}</p>
                            </div>
                            <div class="grid grid-cols-3 gap-4">
                                <div class="text-center">
                                    <p class="text-xs text-gray-500 font-bold uppercase mb-1">Protein</p>
                                    <p class="text-lg font-black">${plan.nutritionPlan.macros.protein}g</p>
                                </div>
                                <div class="text-center">
                                    <p class="text-xs text-gray-500 font-bold uppercase mb-1">Carbs</p>
                                    <p class="text-lg font-black">${plan.nutritionPlan.macros.carbs}g</p>
                                </div>
                                <div class="text-center">
                                    <p class="text-xs text-gray-500 font-bold uppercase mb-1">Fats</p>
                                    <p class="text-lg font-black">${plan.nutritionPlan.macros.fats}g</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h2 class="text-2xl font-black mb-6 uppercase tracking-tighter">Workout Schedule</h2>
                    <div class="space-y-8 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        ${plan.workoutPlan.map((phase, i) => `
                            <div class="space-y-4">
                                <h3 class="text-xl font-black text-orange-600 uppercase tracking-tight flex items-center gap-2">
                                    <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-sm">${i + 1}</div>
                                    ${phase.phase}
                                </h3>
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    ${phase.days.map((day, j) => `
                                        <div class="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                                            <h4 class="font-bold text-gray-900 mb-3">${day.title}</h4>
                                            <ul class="space-y-2">
                                                ${day.exercises.map(ex => `
                                                    <li class="text-sm text-gray-600 flex items-center gap-2">
                                                        <div class="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                                                        ${ex}
                                                    </li>
                                                `).join('')}
                                            </ul>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <div class="text-center mt-10">
                <button onclick="resetPlan()" class="text-orange-600 font-bold hover:underline">Generate a different plan</button>
            </div>
        </div>
    `;
};

window.resetPlan = () => {
    state.aiPlan = null;
    render();
};

const Community = async () => {
    if (!state.user) return '';

    const q = window.firebase.query(
        window.firebase.collection(window.firebase.db, "posts"),
        window.firebase.orderBy("createdAt", "desc"),
        window.firebase.limit(20)
    );
    const snapshot = await window.firebase.getDocs(q);
    state.posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return `
        <div class="min-h-screen bg-gray-50 pt-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto pb-20 fade-in">
            <div class="mb-10 text-center">
                <h1 class="text-4xl font-black tracking-tighter text-gray-900 mb-4 uppercase">
                    WARRIOR <span class="text-orange-500 italic">COMMUNITY</span>
                </h1>
                <p class="text-gray-600">Share your progress, get inspired, and grow together.</p>
            </div>

            <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
                <form id="post-form" class="space-y-4">
                    <textarea id="post-content" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none resize-none h-32" placeholder="What's on your mind, warrior?" required></textarea>
                    <div class="flex justify-end">
                        <button type="submit" class="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2">
                            <i data-lucide="send" class="w-4 h-4"></i>
                            Post
                        </button>
                    </div>
                </form>
            </div>

            <div class="space-y-6">
                ${state.posts.map(post => `
                    <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <div class="flex items-center gap-4 mb-6">
                            <img src="https://picsum.photos/seed/${post.userId}/100/100" class="w-12 h-12 rounded-2xl border-2 border-orange-100" alt="avatar" referrerPolicy="no-referrer">
                            <div>
                                <h3 class="font-bold text-gray-900">${post.userName || 'Warrior'}</h3>
                                <p class="text-xs text-gray-400 uppercase font-bold tracking-widest">${new Date(post.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <p class="text-gray-700 leading-relaxed mb-6">${post.content}</p>
                        <div class="flex items-center gap-6 pt-6 border-t border-gray-50">
                            <button onclick="likePost('${post.id}')" class="flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors group">
                                <i data-lucide="heart" class="w-5 h-5 group-hover:fill-orange-500"></i>
                                <span class="text-sm font-bold">${post.likes || 0}</span>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
};

const WorkoutTracker = () => {
    return `
        <div class="min-h-screen bg-gray-50 pt-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto pb-20 fade-in">
            <div class="mb-10 text-center">
                <h1 class="text-4xl font-black tracking-tighter text-gray-900 mb-4 uppercase">
                    WORKOUT <span class="text-orange-500 italic">TRACKER</span>
                </h1>
                <p class="text-gray-600">Log your sessions and watch your progress soar.</p>
            </div>

            <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <form id="workout-form" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label class="text-sm font-bold text-gray-700">Workout Type</label>
                            <input id="workout-type" type="text" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" placeholder="e.g., Upper Body" required>
                        </div>
                        <div class="space-y-2">
                            <label class="text-sm font-bold text-gray-700">Duration (min)</label>
                            <input id="workout-duration" type="number" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" placeholder="60" required>
                        </div>
                    </div>
                    <div class="space-y-2">
                        <label class="text-sm font-bold text-gray-700">Notes</label>
                        <textarea id="workout-notes" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none h-24 resize-none" placeholder="How did it feel?"></textarea>
                    </div>
                    <button type="submit" class="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20">
                        Log Session
                    </button>
                </form>
            </div>
        </div>
    `;
};

// AI Generation Logic
const handleGeneratePlan = async (e) => {
    e.preventDefault();
    if (!state.user) return;

    const weight = document.getElementById('ai-weight').value;
    const height = document.getElementById('ai-height').value;
    const age = document.getElementById('ai-age').value;
    const goal = document.getElementById('ai-goal').value;
    const btn = document.getElementById('ai-generate-btn');

    btn.disabled = true;
    btn.innerHTML = `<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div><span>Generating...</span>`;

    try {
        const configRes = await fetch('./api/config');
        const { geminiApiKey } = await configRes.json();

        const ai = new window.GoogleGenAI({ apiKey: geminiApiKey });
        const prompt = `Generate a comprehensive 30-day workout and nutrition plan for a user with:
            Weight: ${weight}kg, Height: ${height}cm, Age: ${age}, Goal: ${goal}.
            The plan should be divided into 4 weekly phases (chapters).
            Include REAL exercises with sets and reps.
            Provide a detailed nutrition plan with daily calorie targets and macros.
            Include 5-10 professional fitness tips.`;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        workoutPlan: {
                            type: "ARRAY",
                            items: {
                                type: "OBJECT",
                                properties: {
                                    phase: { type: "STRING" },
                                    days: {
                                        type: "ARRAY",
                                        items: {
                                            type: "OBJECT",
                                            properties: {
                                                title: { type: "STRING" },
                                                exercises: { type: "ARRAY", items: { type: "STRING" } },
                                            },
                                            required: ["title", "exercises"],
                                        },
                                    },
                                },
                                required: ["phase", "days"],
                            },
                        },
                        nutritionPlan: {
                            type: "OBJECT",
                            properties: {
                                calories: { type: "NUMBER" },
                                macros: {
                                    type: "OBJECT",
                                    properties: {
                                        protein: { type: "NUMBER" },
                                        carbs: { type: "NUMBER" },
                                        fats: { type: "NUMBER" },
                                    },
                                    required: ["protein", "carbs", "fats"],
                                },
                            },
                            required: ["calories", "macros"],
                        },
                        tips: { type: "ARRAY", items: { type: "STRING" } },
                    },
                    required: ["workoutPlan", "nutritionPlan", "tips"],
                },
            },
        });

        const planData = JSON.parse(response.text);
        const newPlan = {
            ...planData,
            userId: state.user.uid,
            createdAt: new Date().toISOString()
        };
        
        const docRef = await window.firebase.addDoc(window.firebase.collection(window.firebase.db, "plans"), newPlan);
        state.aiPlan = { id: docRef.id, ...newPlan };
        render();
    } catch (err) {
        console.error("Error generating plan:", err);
        alert("Failed to generate plan: " + err.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<i data-lucide="sparkles" class="w-5 h-5"></i><span>Generate 30-Day Plan</span>`;
        initIcons();
    }
};

// Community logic
window.likePost = async (postId) => {
    const postRef = window.firebase.doc(window.firebase.db, "posts", postId);
    const postSnap = await window.firebase.getDoc(postRef);
    if (postSnap.exists()) {
        const currentLikes = postSnap.data().likes || 0;
        await window.firebase.setDoc(postRef, { likes: currentLikes + 1 }, { merge: true });
        render();
    }
};

const handleCreatePost = async (e) => {
    e.preventDefault();
    const content = document.getElementById('post-content').value;
    if (!state.user) return;

    try {
        await window.firebase.addDoc(window.firebase.collection(window.firebase.db, "posts"), {
            userId: state.user.uid,
            userName: state.user.displayName || 'Warrior',
            content,
            likes: 0,
            createdAt: Date.now()
        });
        render();
    } catch (err) {
        console.error("Error creating post:", err);
    }
};

const handleLogWorkout = async (e) => {
    e.preventDefault();
    const type = document.getElementById('workout-type').value;
    const duration = document.getElementById('workout-duration').value;
    const notes = document.getElementById('workout-notes').value;
    if (!state.user) return;

    try {
        await window.firebase.addDoc(window.firebase.collection(window.firebase.db, "workouts"), {
            userId: state.user.uid,
            type,
            duration: parseInt(duration),
            notes,
            createdAt: new Date().toISOString()
        });
        navigate('/dashboard');
    } catch (err) {
        console.error("Error logging workout:", err);
    }
};

// Main render function
const render = async () => {
    Navbar();
    const app = document.getElementById('app');

    if (state.loading) {
        app.innerHTML = `
            <div class="flex items-center justify-center h-[calc(100vh-64px)]">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        `;
        return;
    }

    // Auth check for private routes
    const privateRoutes = ['/dashboard', '/exercises', '/workout', '/ai-plan', '/community'];
    if (privateRoutes.includes(state.currentPath) && !state.user) {
        navigate('/auth');
        return;
    }

    switch (state.currentPath) {
        case '/':
            app.innerHTML = await LandingPage();
            break;
        case '/auth':
            if (state.user) {
                navigate('/dashboard');
            } else {
                app.innerHTML = AuthPage();
                document.getElementById('auth-form').onsubmit = handleAuth;
            }
            break;
        case '/dashboard':
            app.innerHTML = await Dashboard();
            break;
        case '/exercises':
            app.innerHTML = ExerciseLibrary();
            break;
        case '/workout':
            app.innerHTML = WorkoutTracker();
            document.getElementById('workout-form').onsubmit = handleLogWorkout;
            break;
        case '/ai-plan':
            app.innerHTML = await AIPlan();
            const aiForm = document.getElementById('ai-plan-form');
            if (aiForm) aiForm.onsubmit = handleGeneratePlan;
            break;
        case '/community':
            app.innerHTML = await Community();
            document.getElementById('post-form').onsubmit = handleCreatePost;
            break;
        default:
            app.innerHTML = `<div class="p-8 text-center pt-24">404 - Page Not Found</div>`;
    }
    initIcons();
};

const handleAuth = async (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const name = document.getElementById('auth-name').value;
    const errorDiv = document.getElementById('auth-error');

    try {
        if (isLogin) {
            await window.firebase.signInWithEmailAndPassword(window.firebase.auth, email, password);
        } else {
            const userCred = await window.firebase.createUserWithEmailAndPassword(window.firebase.auth, email, password);
            await window.firebase.setDoc(window.firebase.doc(window.firebase.db, "users", userCred.user.uid), {
                name,
                email,
                createdAt: new Date().toISOString()
            });
        }
        navigate('/dashboard');
    } catch (err) {
        errorDiv.innerText = err.message;
        errorDiv.classList.remove('hidden');
    }
};

// Initial render
render();
