import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { ArrowRight, Leaf, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { PAGE_HEROES } from "../assets/images";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    password2: "",
  });
  const [loading, setLoading] = useState(false);
  const h = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password2) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success("Welcome to PantryPal AI! 🥗");
      navigate("/");
    } catch (err) {
      const d = err.response?.data;
      toast.error(
        d?.username?.[0] ||
          d?.email?.[0] ||
          d?.password?.[0] ||
          "Registration failed."
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
      {/* ── Left: Full-bleed Warm Citrus & Spice Photography ── */}
      <div className="hidden md:flex flex-col justify-between w-[48%] relative overflow-hidden p-12 bg-charcoal">
        <img
          src={PAGE_HEROES.register}
          alt="Warm citrus slices, cinnamon and star anise"
          className="absolute inset-0 w-full h-full object-cover animate-ken-burns"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(155deg, rgba(28,16,8,0.45) 0%, rgba(28,16,8,0.88) 100%)",
          }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
            style={{
              background: "linear-gradient(135deg, #2D4A2D, #3A6B3A)",
            }}
          >
            <Leaf size={18} className="text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-xl text-white block leading-none">
              PantryPal AI
            </span>
            <span className="font-sans text-[11px] text-white/70 tracking-widest uppercase">
              Smart Kitchen Companion
            </span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-dark text-amber-200 text-xs font-sans font-bold uppercase tracking-widest mb-4">
              <Sparkles size={11} /> Zero-Waste Living
            </div>
            <p className="font-display italic text-white text-3xl sm:text-4xl font-bold leading-snug drop-shadow-lg">
              "Scan once.
              <br />
              Know everything
              <br />
              about your pantry."
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            {[
              "📸 AI Vision detects groceries from a single photo",
              "📅 Automated OCR expiry tracking & smart alerts",
              "📜 Unroll custom recipes matched to your shelves",
              "🛒 One-tap auto-generated market lists",
            ].map((f) => (
              <div
                key={f}
                className="flex items-center gap-3 font-sans text-xs text-white/85 px-3.5 py-2.5 rounded-2xl glass-dark"
              >
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 font-sans text-white/50 text-xs">
          Free forever · Artisanal Kitchen Edition
        </p>
      </div>

      {/* ── Right: Registration Form ── */}
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7 }}
        className="flex-1 flex items-center justify-center p-6 sm:p-12 safe-top safe-bottom"
      >
        <div className="w-full max-w-sm">
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

          <div className="mb-7">
            <p className="section-label mb-1">Onboarding</p>
            <h1 className="font-display text-3xl font-bold text-charcoal mb-1.5">
              Create your kitchen
            </h1>
            <p className="font-sans text-sm" style={{ color: "#7A7060" }}>
              Start organizing your pantry with AI today
            </p>
          </div>

          <form onSubmit={submit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">First Name</label>
                <input
                  name="first_name"
                  value={form.first_name}
                  onChange={h}
                  className="input"
                  placeholder="Jane"
                />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input
                  name="last_name"
                  value={form.last_name}
                  onChange={h}
                  className="input"
                  placeholder="Doe"
                />
              </div>
            </div>
            <div>
              <label className="label">
                Username <span className="text-red-400">*</span>
              </label>
              <input
                name="username"
                value={form.username}
                onChange={h}
                className="input"
                placeholder="janedoe"
                required
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={h}
                className="input"
                placeholder="jane@example.com"
              />
            </div>
            <div>
              <label className="label">
                Password <span className="text-red-400">*</span>
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={h}
                className="input"
                placeholder="Min. 8 characters"
                required
                minLength={8}
              />
            </div>
            <div>
              <label className="label">
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <input
                name="password2"
                type="password"
                value={form.password2}
                onChange={h}
                className="input"
                placeholder="Repeat password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-12 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create Account <ArrowRight size={15} />
                </span>
              )}
            </button>
          </form>

          <p
            className="font-sans text-center text-sm mt-6"
            style={{ color: "#7A7060" }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-forest hover:text-forest-light transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
