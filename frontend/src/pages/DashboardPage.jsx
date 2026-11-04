import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { analytics as analyticsApi, pantry as pantryApi } from "../api/client";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/ui/StatusBadge";
import Spinner from "../components/ui/Spinner";
import ScrollReveal, { StaggerList } from "../components/ui/ScrollReveal";
import ParallaxImage from "../components/ui/ParallaxImage";
import AnimatedCounter from "../components/ui/AnimatedCounter";
import FloatingCard from "../components/ui/FloatingCard";
import {
  ArrowRight, Bell, ScanLine, ChefHat, ShoppingCart,
  TrendingUp, Sparkles, Leaf, Flame, Compass
} from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  PAGE_HEROES, FOOD_IMAGES, CATEGORY_IMAGES, CURATED_COLLECTIONS
} from "../assets/images";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCollection, setActiveCollection] = useState(0);

  useEffect(() => {
    Promise.all([analyticsApi.get(), pantryApi.list()])
      .then(([s, i]) => {
        setStats(s.data);
        setItems(i.data.slice(0, 6));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Spinner size="lg" />
        <p className="font-sans text-sm text-charcoal/40">
          Preparing your culinary workspace…
        </p>
      </div>
    );

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-10 -mx-4 md:-mx-8 -mt-6 md:-mt-8">
      {/* ── Full-bleed Parallax Hero with Heirloom Cutting Board ── */}
      <ParallaxImage
        src={PAGE_HEROES.dashboard}
        alt="Artisanal wooden cutting board framed by fresh heirloom produce"
        height="h-80 sm:h-96"
        overlayStyle={{
          background:
            "linear-gradient(180deg, rgba(16,18,14,0.28) 0%, rgba(20,18,14,0.52) 45%, rgba(22,18,14,0.88) 100%)",
        }}
      >
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-dark text-white/90 text-xs font-sans font-semibold tracking-wider uppercase">
              <Sparkles size={12} className="text-amber-300" />
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </div>

            <h1 className="font-display text-white text-3xl sm:text-5xl font-bold leading-tight drop-shadow-lg">
              {greet()}, {user?.first_name || user?.username}
            </h1>

            <p className="font-sans text-white/80 text-sm sm:text-base max-w-xl leading-relaxed">
              Your smart kitchen is tracking{" "}
              <span className="font-bold text-amber-200">
                {stats?.total ?? 0} artisanal ingredients
              </span>
              . Discover zero-waste recipes tailored to your freshest harvest.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                to="/scan"
                className="inline-flex items-center gap-2.5 font-sans font-semibold text-sm px-6 py-3 rounded-2xl transition-all hover:scale-105 shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #2D4A2D 0%, #3A6B3A 100%)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.25)",
                }}
              >
                <ScanLine size={15} /> Launch AI Scanner <ArrowRight size={14} />
              </Link>
              <Link
                to="/recipes"
                className="inline-flex items-center gap-2 font-sans font-semibold text-sm px-5 py-3 rounded-2xl transition-all hover:bg-white/25 glass-dark text-white"
              >
                <ChefHat size={15} className="text-amber-300" /> Open Recipe Scroll
              </Link>
            </div>
          </motion.div>
        </div>
      </ParallaxImage>

      {/* ── Main Content Container ── */}
      <div className="px-4 md:px-8 space-y-10">
        {/* ── Expiry Alerts Banner ── */}
        {stats?.alerts?.length > 0 && (
          <ScrollReveal variant="fadeUp">
            <motion.div
              className="relative rounded-3xl p-5 overflow-hidden border shadow-card"
              style={{
                background: "linear-gradient(135deg, #FEF9F0 0%, #FAF0E1 100%)",
                borderColor: "rgba(193,123,74,0.35)",
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                    style={{ background: "rgba(193,123,74,0.16)" }}
                  >
                    <Bell size={18} style={{ color: "#C17B4A" }} />
                  </div>
                  <div>
                    <p
                      className="font-display font-bold text-base mb-1"
                      style={{ color: "#8B5A2B" }}
                    >
                      Chef's Freshness Priority
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                      {stats.alerts.slice(0, 4).map((a, i) => (
                        <p
                          key={i}
                          className="font-sans text-xs font-medium"
                          style={{ color: "#9C6635" }}
                        >
                          • {a}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
                <Link
                  to="/recipes"
                  className="btn-warm text-xs px-4 py-2.5 shrink-0 self-start sm:self-center"
                >
                  Cook Expiring Items <ArrowRight size={13} />
                </Link>
              </div>
            </motion.div>
          </ScrollReveal>
        )}

        {/* ── Stats Row with Photographic Accents ── */}
        <div>
          <ScrollReveal variant="fadeLeft">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="section-label">Live Telemetry</p>
                <h2 className="font-display text-2xl font-bold text-charcoal">
                  Pantry Stock Overview
                </h2>
              </div>
              <Link
                to="/analytics"
                className="font-sans text-xs font-semibold text-forest flex items-center gap-1 hover:gap-2 transition-all"
              >
                Full Analytics <ArrowRight size={12} />
              </Link>
            </div>
          </ScrollReveal>

          <StaggerList className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Total Stocked",
                sub: "Active ingredients",
                value: stats?.total ?? 0,
                color: "#2D4A2D",
                img: FOOD_IMAGES.harvest,
              },
              {
                label: "Peak Freshness",
                sub: "Optimal quality",
                value: stats?.fresh ?? 0,
                color: "#3A6B3A",
                img: FOOD_IMAGES.veggies,
              },
              {
                label: "Use Soon",
                sub: "Expiring within 3d",
                value: stats?.expiring_soon ?? 0,
                color: "#C17B4A",
                img: FOOD_IMAGES.citrusspice,
              },
              {
                label: "Past Prime",
                sub: "Needs restocking",
                value: stats?.expired ?? 0,
                color: "#9B3B30",
                img: FOOD_IMAGES.spices,
              },
            ].map(({ label, sub, value, color, img }) => (
              <FloatingCard
                key={label}
                className="relative bg-white rounded-3xl shadow-card border border-sand/40 p-5 overflow-hidden group"
              >
                {/* Corner photographic accent */}
                <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full overflow-hidden opacity-20 group-hover:opacity-35 group-hover:scale-110 transition-all duration-500 pointer-events-none">
                  <img src={img} alt={label} className="w-full h-full object-cover" />
                </div>
                <div className="relative z-10">
                  <AnimatedCounter
                    value={value}
                    className="font-display text-4xl font-black block tracking-tight"
                    style={{ color }}
                  />
                  <p className="font-display font-bold text-sm text-charcoal mt-1.5">
                    {label}
                  </p>
                  <p className="font-sans text-xs text-charcoal/45">{sub}</p>
                </div>
              </FloatingCard>
            ))}
          </StaggerList>
        </div>

        {/* ── Quick Actions Editorial Trio ── */}
        <div>
          <ScrollReveal variant="fadeUp">
            <div className="mb-4">
              <p className="section-label">Core Workflows</p>
              <h2 className="font-display text-2xl font-bold text-charcoal">
                Interactive Kitchen Studio
              </h2>
            </div>
          </ScrollReveal>

          <StaggerList className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                to: "/scan",
                badge: "Computer Vision",
                label: "AI Vision Scanner",
                desc: "Drop a photo of your fridge or groceries for instant recognition",
                img: FOOD_IMAGES.cookingpan,
                overlay:
                  "linear-gradient(to bottom, rgba(10,14,10,0.15) 0%, rgba(16,32,18,0.88) 100%)",
              },
              {
                to: "/recipes",
                badge: "Artisanal Scroll",
                label: "Chef's Recipe Scroll",
                desc: "Unroll curated dishes matched to your available ingredients",
                img: FOOD_IMAGES.scroll,
                overlay:
                  "linear-gradient(to bottom, rgba(20,12,6,0.15) 0%, rgba(48,26,12,0.88) 100%)",
              },
              {
                to: "/shopping",
                badge: "Smart Restock",
                label: "Curated Grocery List",
                desc: "Auto-generate missing recipe staples with one tap",
                img: FOOD_IMAGES.bowls,
                overlay:
                  "linear-gradient(to bottom, rgba(20,10,10,0.15) 0%, rgba(56,16,16,0.88) 100%)",
              },
            ].map(({ to, badge, label, desc, img, overlay }) => (
              <Link key={to} to={to} className="group block">
                <motion.div
                  className="relative h-56 rounded-3xl overflow-hidden shadow-card-md"
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <img
                    src={img}
                    alt={label}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0" style={{ background: overlay }} />
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-[11px] font-sans font-bold uppercase tracking-wider text-white glass-dark">
                      {badge}
                    </span>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/15 backdrop-blur-md text-white group-hover:bg-white group-hover:text-charcoal transition-all">
                      <ArrowRight size={14} />
                    </div>
                  </div>
                  <div className="absolute bottom-5 left-5 right-5">
                    <p className="font-display font-bold text-white text-xl leading-tight">
                      {label}
                    </p>
                    <p className="font-sans text-xs text-white/80 mt-1 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </StaggerList>
        </div>

        {/* ── Curated Seasonal Moodboard & Color Stories (Uses all Pinterest Aesthetics) ── */}
        <ScrollReveal variant="fadeUp">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <p className="section-label flex items-center gap-1.5">
                  <Compass size={12} /> Culinary Aesthetics
                </p>
                <h2 className="font-display text-2xl font-bold text-charcoal">
                  Seasonal Palette & Inspiration
                </h2>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {CURATED_COLLECTIONS.map((col, idx) => (
                  <button
                    key={col.id}
                    onClick={() => setActiveCollection(idx)}
                    className={`px-3 py-1.5 rounded-xl font-sans text-xs font-semibold transition-all ${
                      activeCollection === idx
                        ? "bg-forest text-white shadow-sm"
                        : "bg-sand/25 text-charcoal/60 hover:bg-sand/40"
                    }`}
                  >
                    {col.title.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Featured Large Showcase Card */}
              <div className="lg:col-span-7 relative h-72 sm:h-80 rounded-3xl overflow-hidden shadow-card-md group">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={CURATED_COLLECTIONS[activeCollection].image}
                    src={CURATED_COLLECTIONS[activeCollection].image}
                    alt={CURATED_COLLECTIONS[activeCollection].title}
                    initial={{ opacity: 0, scale: 1.06 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.55 }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(14,16,12,0.88) 0%, rgba(14,16,12,0.25) 60%, transparent 100%)",
                  }}
                />
                <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full text-[10px] font-sans font-bold uppercase tracking-widest glass-dark text-amber-200 mb-2">
                      {CURATED_COLLECTIONS[activeCollection].tag}
                    </span>
                    <h3 className="font-display text-2xl sm:text-3xl font-bold text-white">
                      {CURATED_COLLECTIONS[activeCollection].title}
                    </h3>
                    <p className="font-sans text-sm text-white/80 mt-1">
                      {CURATED_COLLECTIONS[activeCollection].subtitle}
                    </p>
                  </div>
                  <Link
                    to={CURATED_COLLECTIONS[activeCollection].link}
                    className="btn-primary shrink-0 text-xs px-5 py-2.5"
                  >
                    Explore Collection <ArrowRight size={13} />
                  </Link>
                </div>
              </div>

              {/* Thumbnail Grid of Remaining Pinterest Aesthetics */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                {CURATED_COLLECTIONS.slice(0, 4).map((col, idx) => (
                  <motion.button
                    key={col.id}
                    type="button"
                    onClick={() => setActiveCollection(idx)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative h-36 sm:h-[152px] rounded-3xl overflow-hidden text-left shadow-card transition-all ${
                      activeCollection === idx
                        ? "ring-2 ring-forest ring-offset-2"
                        : "opacity-85 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={col.image}
                      alt={col.title}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.1) 100%)",
                      }}
                    />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-amber-200">
                        {col.tag}
                      </p>
                      <p className="font-display font-bold text-xs text-white truncate">
                        {col.title}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Recent Pantry Items & Sustainability Gauge Split ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Recent Items */}
          <div className="lg:col-span-7">
            <ScrollReveal variant="fadeUp">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="section-label">Latest Additions</p>
                  <h3 className="font-display text-xl font-bold text-charcoal">
                    Recent Pantry Harvest
                  </h3>
                </div>
                <Link
                  to="/pantry"
                  className="font-sans text-xs font-semibold text-forest flex items-center gap-1 hover:gap-2 transition-all"
                >
                  View all <ArrowRight size={11} />
                </Link>
              </div>

              <div className="card overflow-hidden divide-y divide-sand/40">
                {items.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="font-display text-base text-charcoal/60">
                      Your pantry is ready for its first scan.
                    </p>
                    <Link to="/scan" className="btn-primary mt-3 text-xs">
                      Scan Groceries
                    </Link>
                  </div>
                ) : (
                  items.map((item, i) => {
                    const thumb =
                      item.image_path ||
                      CATEGORY_IMAGES[item.category] ||
                      CATEGORY_IMAGES.Other;
                    return (
                      <motion.div
                        key={item._id}
                        className="flex items-center gap-3.5 px-4 py-3 hover:bg-cream/60 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06, duration: 0.4 }}
                      >
                        <img
                          src={thumb}
                          alt={item.name}
                          className="w-11 h-11 rounded-2xl object-cover shrink-0 shadow-sm border border-sand/40"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-bold text-sm text-charcoal truncate">
                            {item.name}
                          </p>
                          <p className="font-sans text-xs text-charcoal/45">
                            {item.category} · Qty {item.quantity}
                          </p>
                        </div>
                        <div className="hidden sm:block font-sans text-xs text-charcoal/45 shrink-0">
                          {item.expiry_date
                            ? format(parseISO(item.expiry_date.slice(0, 10)), "MMM d")
                            : "Fresh"}
                        </div>
                        <StatusBadge status={item.status} />
                      </motion.div>
                    );
                  })
                )}
              </div>
            </ScrollReveal>
          </div>

          {/* Zero-Waste Foliage Frame Card */}
          <div className="lg:col-span-5">
            <ScrollReveal variant="scaleUp">
              <div className="relative rounded-3xl overflow-hidden shadow-card-md h-full min-h-[260px] flex flex-col justify-between p-6">
                <img
                  src={FOOD_IMAGES.leafframe}
                  alt="Dark wood framed with lush foliage"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(circle at center, rgba(20,16,12,0.72) 0%, rgba(16,24,16,0.88) 100%)",
                  }}
                />
                <div className="relative z-10 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-bold uppercase tracking-wider glass-dark text-emerald-300">
                    <Leaf size={12} /> Sustainability Score
                  </span>
                  <span className="font-display font-black text-3xl text-white">
                    <AnimatedCounter value={stats?.waste_percentage ?? 0} />%
                  </span>
                </div>

                <div className="relative z-10 my-4 space-y-2">
                  <h3 className="font-display text-xl font-bold text-white">
                    Zero-Waste Kitchen Index
                  </h3>
                  <p className="font-sans text-xs text-white/75 leading-relaxed">
                    {stats?.expired ?? 0} of {stats?.total ?? 0} ingredients past
                    expiry. Keep waste below 10% by cooking expiring items first.
                  </p>
                  <div className="h-2.5 rounded-full overflow-hidden bg-white/15 backdrop-blur-sm">
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(stats?.waste_percentage ?? 0, 100)}%`,
                      }}
                      transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                      style={{
                        background:
                          (stats?.waste_percentage ?? 0) > 30
                            ? "linear-gradient(90deg, #E8B890, #9B3B30)"
                            : "linear-gradient(90deg, #8A9E4A, #3A6B3A)",
                      }}
                    />
                  </div>
                </div>

                <div className="relative z-10 pt-2">
                  <Link
                    to="/analytics"
                    className="inline-flex items-center gap-2 text-xs font-sans font-semibold text-amber-200 hover:text-white transition-colors"
                  >
                    View detailed waste analytics <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
