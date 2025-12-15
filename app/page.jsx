"use client";
import { IoLockClosed, IoMail } from "react-icons/io5";
import { useState, useEffect, useRef } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, db } from "./firebase/firebaseconfig";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { motion } from "framer-motion";

export default function HomePage() {
  const [showRegister, setShowRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Animation stuff

  const canvasRef = useRef();
  const animationIdRef = useRef();
  const MAX_CONNECTION_DISTANCE = 100;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // To stop the animation on redirect

    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
    }

    const ctx = canvas.getContext("2d");

    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    // Dynamic Particle Count based on screen area (safer for mobile)
    const area = width * height;
    // Aim for 1 particle per ~6000 pixels of area, minimum 50, maximum 150
    const dynamicParticleCount = Math.min(
      150,
      Math.max(50, Math.floor(area / 6000))
    );

    // Dynamically scale connection distance based on screen width
    const connectionDistance = width < 600 ? 80 : MAX_CONNECTION_DISTANCE;

    const particles = Array.from({ length: dynamicParticleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 3 + 1,
      dx: (Math.random() - 0.5) * 2,
      dy: (Math.random() - 0.5) * 2,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Drawing particles
      particles.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0 || p.x > width) p.dx *= -1;
        if (p.y < 0 || p.y > height) p.dy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.shadowColor = "white";
        ctx.shadowBlur = 8;
        ctx.fill();
      });

      // Drawing connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255,255,255,${
              1 - dist / connectionDistance
            })`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationIdRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const formRef = useRef();

  useEffect(() => {
    gsap.from(formRef.current, {
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    });
  }, []);

  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/Chatbot");
      }
    });
    return () => unsub();
  }, [router]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", cred.user.uid), {
        username,
        email,
        createdAt: Date.now(),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black flex items-center justify-center px-4 flex-col">
      {/* Canvas Bg */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 w-full h-full" />

      {/* Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="rounded-3xl border border-white/70 bg-black/70 p-8 shadow-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Lumina AI
            </h1>
            <p className="mt-2 text-sm text-white/70">
              Your AI companion for clarity & insight
            </p>
          </div>

          {/* LOGIN */}
          {!showRegister && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm text-white/80">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full rounded-xl border border-white/20 bg-black px-4 text-white placeholder-white/40 outline-none transition focus:border-white focus:ring-1 focus:ring-white"
                  placeholder="you@email.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white/80">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-xl border border-white/20 bg-black px-4 text-white placeholder-white/40 outline-none transition focus:border-white focus:ring-1 focus:ring-white"
                  placeholder="••••••••"
                />
              </div>

              <button
                disabled={loading}
                className="h-12 w-full rounded-full bg-white font-semibold text-black transition hover:bg-white/90 disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Login"}
              </button>

              <p className="text-center text-sm text-white/70">
                Don’t have an account?{" "}
                <span
                  onClick={() => setShowRegister(true)}
                  className="cursor-pointer text-white hover:underline"
                >
                  Register
                </span>
              </p>
            </form>
          )}

          {/* REGISTER */}
          {showRegister && (
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm text-white/80">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 w-full rounded-xl border border-white/20 bg-black px-4 text-white outline-none focus:border-white focus:ring-1 focus:ring-white"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white/80">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full rounded-xl border border-white/20 bg-black px-4 text-white outline-none focus:border-white focus:ring-1 focus:ring-white"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white/80">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-xl border border-white/20 bg-black px-4 text-white outline-none focus:border-white focus:ring-1 focus:ring-white"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-white/80">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 w-full rounded-xl border border-white/20 bg-black px-4 text-white outline-none focus:border-white focus:ring-1 focus:ring-white"
                  placeholder="••••••••"
                />
              </div>

              <button
                disabled={loading}
                className="h-12 w-full rounded-full bg-white font-semibold text-black transition hover:bg-white/90 disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Register"}
              </button>

              <p className="text-center text-sm text-white/70">
                Already have an account?{" "}
                <span
                  onClick={() => setShowRegister(false)}
                  className="cursor-pointer text-white hover:underline"
                >
                  Login
                </span>
              </p>
            </form>
          )}
        </div>
      </motion.div>
      <h3 className="text-white absolute bottom-5 mt-5">
        Created by:{" "}
        <a href="github.com/nabeel0209" target="blank">
          Muhammad Nabeel
        </a>
      </h3>
    </div>
  );
}
