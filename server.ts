import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, "db.json");
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

async function readDB() {
  const data = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(data);
}

async function writeDB(data: any) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth Routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, name } = req.body;
      const db = await readDB();
      
      if (db.users.find((u: any) => u.email === email)) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        id: Date.now().toString(),
        email,
        password: hashedPassword,
        name,
        isPremium: false,
        role: "user"
      };

      db.users.push(newUser);
      await writeDB(db);

      const token = jwt.sign({ userId: newUser.id }, JWT_SECRET);
      const { password: _, ...userWithoutPassword } = newUser;
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const db = await readDB();
      const user = db.users.find((u: any) => u.email === email);

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Middleware to verify JWT
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      req.userId = decoded.userId;
      next();
    } catch (error) {
      res.status(401).json({ message: "Unauthorized" });
    }
  };

  app.get("/api/auth/me", authenticate, async (req: any, res) => {
    const db = await readDB();
    const user = db.users.find((u: any) => u.id === req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Posts Routes
  app.get("/api/posts", async (req, res) => {
    const db = await readDB();
    res.json(db.posts.sort((a: any, b: any) => b.createdAt - a.createdAt));
  });

  app.post("/api/posts", authenticate, async (req: any, res) => {
    const { content, imageUrl, userName } = req.body;
    const db = await readDB();
    
    const newPost = {
      id: Date.now().toString(),
      userId: req.userId,
      userName,
      content,
      imageUrl,
      createdAt: Date.now(),
      likes: 0
    };

    db.posts.push(newPost);
    await writeDB(db);
    res.json(newPost);
  });

  app.post("/api/posts/:id/like", authenticate, async (req, res) => {
    const db = await readDB();
    const post = db.posts.find((p: any) => p.id === req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.likes += 1;
    await writeDB(db);
    res.json(post);
  });

  // Plans Routes
  app.get("/api/plans", authenticate, async (req: any, res) => {
    const db = await readDB();
    const userPlans = db.plans.filter((p: any) => p.userId === req.userId);
    res.json(userPlans);
  });

  app.post("/api/plans", authenticate, async (req: any, res) => {
    const db = await readDB();
    const newPlan = {
      id: Date.now().toString(),
      userId: req.userId,
      ...req.body,
      createdAt: new Date().toISOString()
    };

    db.plans.push(newPlan);
    await writeDB(db);
    res.json(newPlan);
  });

  // Workouts Routes
  app.get("/api/workouts", authenticate, async (req: any, res) => {
    const db = await readDB();
    const userWorkouts = db.workouts.filter((w: any) => w.userId === req.userId);
    res.json(userWorkouts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  });

  app.post("/api/workouts", authenticate, async (req: any, res) => {
    const db = await readDB();
    const newWorkout = {
      id: Date.now().toString(),
      userId: req.userId,
      ...req.body,
      createdAt: new Date().toISOString()
    };

    db.workouts.push(newWorkout);
    await writeDB(db);
    res.json(newWorkout);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
