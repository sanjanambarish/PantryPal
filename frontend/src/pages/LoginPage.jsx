import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, ArrowRight, Leaf, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { FOOD_IMAGES } from "../assets/images";

const SHOWCASE_SLIDES = [
  {
    img: FOOD_IMAGES.veggies,
    quote: "Fresh harvest,\nsmart kitchen.",
    sub: "AI Vision · Expiry Telemetry · Zero-Waste Recipes",
  },
  {
    img: FOOD_IMAGES.cookingpan,
    quote: "Elevate every\ningredient.",
    sub: "Snap a photo of your fridge and let AI curate tonight's menu.",
  },
  {
    img: FOOD_IMAGES.woodtable,
    quote: "Artisanal prep,\neffortless order.",
    sub: "Track shelf life across your entire pantry in real time.",
  },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, set] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setSlide((p) => (p + 1) % SHOWCASE_SLIDES.length),
      5500
    );
    return () => clearInterval(t);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      toast.error(
        err.response?.data?.detail || "Incorrect username or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-[100dvh] flex flex-col md:flex-row"
      style={{ background: "#FAF7F2" }}
    >
      {/* ── Left: Full-bleed Animated Editorial Photo Showcase ── */}
      <div className="hidden md:block relative w-[52%] overflow-hidden bg-charcoal">
        <AnimatePresence mode="wait">
          <motion.img
            key={SHOWCASE_SLIDES[slide].img}
            src={SHOWCASE_SLIDES[slide].img}
            alt="Culinary showcase"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Luxury editorial vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(155deg, rgba(14,22,14,0.35) 0%, rgba(14,20,14,0.4) 45%, rgba(12,16,12,0.88) 100%)",
          }}
        />

        {/* Floating content on photo */}
        <div className="absolute inset-0 flex flex-col justify-between p-12 z-10">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3"
          >
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
              style={{
                background: "linear-gradient(135deg, #2D4A2D, #3A6B3A)",
              }}
            >
              <Leaf size={18} className="text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-xl text-white drop-shadow block leading-none">
                PantryPal AI
              </span>
              <span className="font-sans text-[11px] text-white/70 tracking-widest uppercase">
                Smart Kitchen OS
              </span>
            </div>
          </motion.div>

          <div className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-dark text-amber-200 text-xs font-sans font-bold uppercase tracking-widest mb-4">
                  <Sparkles size={11} /> Culinary Intelligence
                </div>
                <blockquote className="font-display italic text-white text-4xl font-bold leading-tight drop-shadow-lg whitespace-pre-line mb-3">
                  "{SHOWCASE_SLIDES[slide].quote}"
                </blockquote>
                <p className="font-sans text-white/75 text-sm max-w-md">
                  {SHOWCASE_SLIDES[slide].sub}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Slide Indicators */}
            <div className="flex items-center gap-2">
              {SHOWCASE_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setSlide(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    slide === idx ? "w-8 bg-white" : "w-2 bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Sign-In Form ── */}
      <motion.div
        className="flex-1 flex items-center justify-center p-6 sm:p-12 safe-top safe-bottom relative overflow-hidden"
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="w-full max-w-sm relative z-10">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 md:hidden">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #2D4A2D, #3A6B3A)",
              }}
            >
              <Leaf size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-charcoal">
              PantryPal AI
            </span>
          </div>

          <div className="mb-8">
            <p className="section-label mb-1">Chef Portal</p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-charcoal mb-1.5">
              Welcome back
            </h1>
            <p className="font-sans text-sm" style={{ color: "#7A7060" }}>
              Sign in to access your live pantry & recipe scroll
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="label">Username</label>
              <input
                value={form.username}
                onChange={(e) => set({ ...form, username: e.target.value })}
                className="input"
                placeholder="your_username"
                autoComplete="username"
                required
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
            >
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set({ ...form, password: e.target.value })}
                  className="input pr-11"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors text-charcoal/30 hover:text-charcoal/60"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26 }}
            >
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full h-12 mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Enter Kitchen <ArrowRight size={15} />
                  </span>
                )}
              </button>
            </motion.div>
          </form>

          <p
            className="font-sans text-center text-sm mt-7"
            style={{ color: "#7A7060" }}
          >
            New to PantryPal?{" "}
            <Link
              to="/register"
              className="font-semibold text-forest hover:text-forest-light transition-colors"
            >
              Create your kitchen account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
