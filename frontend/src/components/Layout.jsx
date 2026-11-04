import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, ScanLine, Package, ChefHat,
  ShoppingCart, BarChart3, Clock, LogOut, Menu, X, Leaf, Sparkles, ArrowUpRight
} from "lucide-react";
import clsx from "clsx";
import { FOOD_IMAGES } from "../assets/images";

const NAV = [
  { to: "/",          icon: LayoutDashboard, label: "Dashboard",     badge: null   },
  { to: "/scan",      icon: ScanLine,        label: "AI Scanner",    badge: "AI"   },
  { to: "/pantry",    icon: Package,         label: "My Pantry",     badge: null   },
  { to: "/recipes",   icon: ChefHat,         label: "Chef Recipes",  badge: "Scroll"},
  { to: "/shopping",  icon: ShoppingCart,    label: "Shopping List", badge: null   },
  { to: "/analytics", icon: BarChart3,       label: "Analytics",     badge: null   },
  { to: "/timeline",  icon: Clock,           label: "Timeline",      badge: null   },
];

const SEASONAL_TIPS = [
  { quote: "Eat fresh, waste less.", tip: "Scan your fridge weekly to catch expiring produce early.", img: FOOD_IMAGES.spices },
  { quote: "Cook from your harvest.", tip: "Turn ripened fruits & herbs into vibrant zero-waste meals.", img: FOOD_IMAGES.citrusspice },
  { quote: "Balance every bowl.", tip: "Pair crisp greens with healthy fats and aromatic spices.", img: FOOD_IMAGES.leafframe },
];

function SidebarContent({ onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [tipIdx, setTipIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTipIdx((p) => (p + 1) % SEASONAL_TIPS.length), 6000);
    return () => clearInterval(t);
  }, []);

  const currentTip = SEASONAL_TIPS[tipIdx];

  return (
    <div className="flex flex-col h-full relative overflow-hidden" style={{ background: "#FEFCF8" }}>
      {/* Subtle ambient top glow */}
      <div
        className="absolute -top-20 -left-20 w-56 h-56 rounded-full pointer-events-none opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, #C17B4A 0%, transparent 70%)" }}
      />

      {/* Brand Logo */}
      <div className="relative flex items-center gap-3.5 px-6 pt-7 pb-5">
        <motion.div
          whileHover={{ rotate: 12, scale: 1.06 }}
          className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #2D4A2D 0%, #3A6B3A 100%)",
            boxShadow: "0 6px 18px rgba(45,74,45,0.32)",
          }}
        >
          <Leaf size={18} className="text-white relative z-10" />
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-display font-bold text-base leading-tight text-charcoal tracking-tight">
              PantryPal
            </p>
            <span
              className="font-sans text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md"
              style={{ background: "rgba(193,123,74,0.15)", color: "#C17B4A" }}
            >
              AI
            </span>
          </div>
          <p className="font-sans text-xs text-charcoal/45 font-medium mt-0.5">
            Culinary & Kitchen OS
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-sand/30 text-charcoal/40 hover:text-charcoal transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Mini Photographic Banner Strip */}
      <div className="mx-4 mb-5 relative h-14 rounded-2xl overflow-hidden shadow-card group">
        <img
          src={FOOD_IMAGES.sunlit}
          alt="Botanical kitchen"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div
          className="absolute inset-0 flex items-center justify-between px-3.5"
          style={{
            background: "linear-gradient(90deg, rgba(28,36,28,0.82) 0%, rgba(28,36,28,0.45) 100%)",
          }}
        >
          <div>
            <p className="font-display text-white text-xs font-semibold tracking-wide">
              Botanical Edition
            </p>
            <p className="font-sans text-[11px] text-white/75">
              Zero-waste smart kitchen
            </p>
          </div>
          <Link
            to="/scan"
            onClick={onClose}
            className="w-7 h-7 rounded-xl flex items-center justify-center bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-all"
            title="Quick AI Scan"
          >
            <Sparkles size={13} />
          </Link>
        </div>
      </div>

      {/* Navigation Links with Framer Motion sliding active pill */}
      <nav className="flex-1 px-3.5 space-y-1 overflow-y-auto">
        <p className="px-3 pb-1.5 font-sans text-[10px] font-bold uppercase tracking-widest text-charcoal/35">
          Kitchen Suite
        </p>
        {NAV.map(({ to, icon: Icon, label, badge }) => {
          const isActive =
            to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={onClose}
              className="relative flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium font-sans transition-colors duration-200 group"
            >
              {isActive && (
                <motion.div
                  layoutId="sidebarActivePill"
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: "linear-gradient(135deg, #2D4A2D 0%, #3A6B3A 100%)",
                    boxShadow: "0 6px 20px rgba(45,74,45,0.28)",
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <Icon
                size={16}
                className={clsx(
                  "shrink-0 relative z-10 transition-transform duration-200 group-hover:scale-110",
                  isActive ? "text-white" : "text-charcoal/55 group-hover:text-forest"
                )}
              />
              <span
                className={clsx(
                  "relative z-10 flex-1",
                  isActive
                    ? "text-white font-semibold"
                    : "text-charcoal/65 group-hover:text-charcoal"
                )}
              >
                {label}
              </span>
              {badge && (
                <span
                  className={clsx(
                    "relative z-10 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-warm/15 text-warm"
                  )}
                >
                  {badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Rotating Photographic Seasonal Tip Card */}
      <div className="mx-3.5 mb-3.5 relative rounded-3xl overflow-hidden shadow-card-md h-36 group">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentTip.img}
            src={currentTip.img}
            alt="Culinary inspiration"
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(155deg, rgba(16,20,16,0.88) 0%, rgba(28,22,16,0.72) 65%, rgba(28,22,16,0.45) 100%)",
          }}
        />
        <div className="relative z-10 p-4 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-widest bg-white/15 text-amber-200 backdrop-blur-md">
              <Sparkles size={10} /> Chef Note
            </span>
            <div className="flex gap-1">
              {SEASONAL_TIPS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setTipIdx(idx)}
                  className={clsx(
                    "h-1 rounded-full transition-all",
                    idx === tipIdx ? "w-4 bg-white" : "w-1.5 bg-white/35"
                  )}
                />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tipIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35 }}
            >
              <p className="font-display text-white text-xs font-bold italic mb-1">
                "{currentTip.quote}"
              </p>
              <p className="font-sans text-white/75 text-[11px] leading-snug line-clamp-2">
                {currentTip.tip}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="px-3.5 pb-5">
        <div
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border transition-all"
          style={{
            background: "rgba(250,247,242,0.9)",
            borderColor: "rgba(212,197,169,0.5)",
          }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-display font-bold text-sm text-white shadow-sm"
            style={{ background: "linear-gradient(135deg, #C17B4A, #8B5A2B)" }}
          >
            {(user?.first_name?.[0] || user?.username?.[0] || "U").toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-sans text-sm font-semibold text-charcoal truncate">
              {user?.first_name
                ? `${user.first_name} ${user.last_name || ""}`.trim()
                : user?.username}
            </p>
            <p className="font-sans text-xs text-charcoal/45 truncate">
              {user?.email || "Head Chef"}
            </p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="p-2 rounded-xl hover:bg-red-50 hover:text-red-500 text-charcoal/35 transition-colors"
            title="Log out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location]);

  return (
    <div className="flex h-[100dvh] overflow-hidden" style={{ background: "#FAF7F2" }}>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-68 shrink-0 border-r border-sand/50 shadow-sm z-20">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/35 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="relative w-72 h-full shadow-card-lg"
            >
              <SidebarContent onClose={() => setOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3.5 bg-cream/90 backdrop-blur-md border-b border-sand/60 safe-top shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="p-2 rounded-xl hover:bg-sand/40 transition-colors"
            >
              <Menu size={20} className="text-charcoal/70" />
            </button>
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #2D4A2D, #3A6B3A)" }}
              >
                <Leaf size={13} className="text-white" />
              </div>
              <span className="font-display font-bold text-sm text-charcoal">
                PantryPal AI
              </span>
            </div>
          </div>
          <Link
            to="/scan"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-sans font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #2D4A2D, #3A6B3A)" }}
          >
            <Sparkles size={12} /> Scan
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto bg-cream relative">
          <div className="max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-8 safe-bottom">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
