import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { recipes as recipesApi, shopping as shoppingApi } from "../api/client";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import ScrollReveal from "../components/ui/ScrollReveal";
import ParallaxImage from "../components/ui/ParallaxImage";
import FloatingCard from "../components/ui/FloatingCard";
import toast from "react-hot-toast";
import {
  ChefHat, Clock, ShoppingCart, CheckCircle, XCircle,
  Flame, ScrollText, LayoutGrid, Disc, X, Sparkles
} from "lucide-react";
import { PAGE_HEROES, FOOD_IMAGES } from "../assets/images";

const EMOJIS = {
  "Cheese Omelette": "🍳",
  "French Toast": "🍞",
  "Egg Sandwich": "🥪",
  "Banana Smoothie": "🍌",
  "Carrot Soup": "🥕",
  "Apple Cinnamon Toast": "🍎",
  "Orange Juice Sorbet": "🍊",
  "Grilled Cheese Sandwich": "🧀",
  "Milk Pudding": "🍮",
  "Scrambled Eggs": "🥚",
};

const RECIPE_PHOTOS = [
  FOOD_IMAGES.cookingpan,
  FOOD_IMAGES.citrusspice,
  FOOD_IMAGES.bowls,
  FOOD_IMAGES.fruits,
  FOOD_IMAGES.veggies,
  FOOD_IMAGES.sunlit,
  FOOD_IMAGES.colorsplit,
  FOOD_IMAGES.earthy,
  FOOD_IMAGES.harvest,
  FOOD_IMAGES.purple,
];

function getCookingSteps(recipe) {
  if (recipe.steps?.length) return recipe.steps;
  return [
    `Gather and prep your freshest pantry staples: ${recipe.available_ingredients.join(", ") || "core ingredients"}.`,
    `Preheat your skillet or prep station to medium heat and season lightly with sea salt and aromatics.`,
    `Combine the primary ingredients gently, allowing natural flavors to caramelize for ${recipe.time || "10–15 mins"}.`,
    `Plate warm on a rustic wooden board, garnish with fresh herbs, and serve immediately.`,
  ];
}

export default function RecipesPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState("cards"); // "cards" | "platter"
  const [activeScroll, setActiveScroll] = useState(null);

  useEffect(() => {
    recipesApi
      .get()
      .then((r) => setList(r.data))
      .catch(() => toast.error("Could not load recipes."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = list.filter((r) => {
    if (filter === "can_make") return r.can_make;
    if (filter === "partial") return !r.can_make && r.match_score > 0;
    return true;
  });

  const addMissing = async (recipe) => {
    if (!recipe.missing_ingredients.length) {
      toast("All ingredients are already in your pantry!", { icon: "✅" });
      return;
    }
    try {
      await Promise.all(
        recipe.missing_ingredients.map((ing) =>
          shoppingApi.add({
            name: ing,
            quantity: 1,
            reason: `Recipe: ${recipe.name}`,
          })
        )
      );
      toast.success(
        `Added ${recipe.missing_ingredients.length} missing item(s) to your Shopping List!`
      );
    } catch {
      toast.error("Could not add to shopping list.");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );

  return (
    <div className="-mx-4 md:-mx-8 -mt-6 md:-mt-8 space-y-0">
      {/* ── Hero with Vintage Kitchen Parchment Scroll ── */}
      <ParallaxImage
        src={PAGE_HEROES.recipes}
        alt="Vintage parchment scroll in a warm rustic kitchen"
        height="h-64 sm:h-72"
        overlayStyle={{
          background:
            "linear-gradient(to bottom, rgba(20,12,6,0.25) 0%, rgba(42,22,10,0.88) 100%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-2"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-dark text-amber-200 text-xs font-sans font-bold uppercase tracking-widest">
            <Sparkles size={12} /> AI Culinary Matcher
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">
            Chef's Recipe Scroll
          </h1>
          <p className="font-sans text-sm text-white/80 max-w-lg">
            Artisanal dishes curated automatically from your live pantry
            inventory. Click any dish to unroll the full kitchen scroll.
          </p>
        </motion.div>
      </ParallaxImage>

      <div className="px-4 md:px-8 pt-6 space-y-6">
        {/* ── Filter Tabs & Platter View Switcher ── */}
        <ScrollReveal variant="fadeUp">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2 p-1.5 rounded-2xl bg-sand/25 border border-sand/40">
              {[
                { key: "all", label: "All Dishes" },
                { key: "can_make", label: "✅ Ready to Cook" },
                { key: "partial", label: "🔧 Almost Ready" },
              ].map(({ key, label }) => (
                <motion.button
                  key={key}
                  onClick={() => setFilter(key)}
                  whileTap={{ scale: 0.96 }}
                  className="font-sans px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                  style={
                    filter === key
                      ? {
                          background: "#2D4A2D",
                          color: "#fff",
                          boxShadow: "0 4px 12px rgba(45,74,45,0.25)",
                        }
                      : { color: "#5C4A3A" }
                  }
                >
                  {label}
                </motion.button>
              ))}
            </div>

            {/* View mode toggle: Editorial Cards vs Rustic Platter Menu */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-sand/25 border border-sand/40">
              <button
                onClick={() => setViewMode("cards")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-sans text-xs font-semibold transition-all ${
                  viewMode === "cards"
                    ? "bg-white text-forest shadow-sm"
                    : "text-charcoal/55 hover:text-charcoal"
                }`}
              >
                <LayoutGrid size={13} /> Editorial Cards
              </button>
              <button
                onClick={() => setViewMode("platter")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-sans text-xs font-semibold transition-all ${
                  viewMode === "platter"
                    ? "bg-white text-warm shadow-sm"
                    : "text-charcoal/55 hover:text-charcoal"
                }`}
              >
                <Disc size={13} /> Wooden Platter Menu
              </button>
            </div>
          </div>
        </ScrollReveal>

        {filtered.length === 0 ? (
          <EmptyState
            icon={ChefHat}
            title="No recipes match your filter"
            description="Add more ingredients to your pantry or switch tabs above."
          />
        ) : viewMode === "platter" ? (
          /* ── Rustic Wooden Platter Menu View (Inspired by woodmenu.jpg) ── */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-4xl overflow-hidden shadow-card-lg p-6 sm:p-10"
          >
            <img
              src={FOOD_IMAGES.woodmenu}
              alt="Rustic wooden menu background"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(28,16,8,0.82) 0%, rgba(36,20,10,0.88) 100%)",
              }}
            />

            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
              {/* Chalkboard Menu Sign Header */}
              <div className="mx-auto w-fit px-10 py-4 rounded-full border-4 border-amber-700/60 bg-charcoal/90 shadow-2xl text-center">
                <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-amber-300/80">
                  Artisanal Tasting Board
                </p>
                <h2 className="font-display text-3xl font-bold text-white tracking-widest uppercase">
                  MENU
                </h2>
              </div>

              {/* Staggered Circular Wooden Platter Items */}
              <div className="space-y-6">
                {filtered.map((recipe, i) => {
                  const emoji = EMOJIS[recipe.name] || "🍽";
                  const photo = RECIPE_PHOTOS[i % RECIPE_PHOTOS.length];
                  const isEven = i % 2 === 0;
                  return (
                    <motion.div
                      key={recipe.name}
                      initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className={`flex flex-col sm:flex-row items-center gap-5 ${
                        isEven ? "" : "sm:flex-row-reverse"
                      }`}
                    >
                      {/* Circular Wooden Platter */}
                      <motion.div
                        whileHover={{ scale: 1.06, rotate: isEven ? 3 : -3 }}
                        onClick={() =>
                          setActiveScroll({ ...recipe, photo, emoji })
                        }
                        className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full shrink-0 p-2.5 cursor-pointer shadow-2xl"
                        style={{
                          background:
                            "radial-gradient(circle, #A67B5B 0%, #6F4E37 70%, #4A3222 100%)",
                          boxShadow:
                            "0 14px 36px rgba(0,0,0,0.45), inset 0 2px 6px rgba(255,255,255,0.25)",
                        }}
                      >
                        <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-amber-950/50">
                          <img
                            src={photo}
                            alt={recipe.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                            <span className="text-5xl drop-shadow-lg">
                              {emoji}
                            </span>
                          </div>
                        </div>
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold bg-amber-100 text-amber-950 shadow">
                          {Math.round(recipe.match_score * 100)}% Match
                        </span>
                      </motion.div>

                      {/* Kraft Paper Label Strip */}
                      <div
                        onClick={() =>
                          setActiveScroll({ ...recipe, photo, emoji })
                        }
                        className="flex-1 w-full rounded-2xl p-5 cursor-pointer transition-transform hover:-translate-y-1 shadow-xl relative overflow-hidden"
                        style={{
                          background:
                            "linear-gradient(135deg, #E6CFAF 0%, #D4B895 100%)",
                          border: "1px solid rgba(139,90,43,0.35)",
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-display font-bold text-lg text-charcoal">
                              {recipe.name}
                            </h3>
                            <p className="font-sans text-xs text-charcoal/70 mt-0.5">
                              {recipe.description}
                            </p>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-xs font-sans font-bold bg-charcoal/10 text-charcoal shrink-0">
                            {recipe.time}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-charcoal/10 text-xs font-sans font-semibold text-charcoal/80">
                          <span>
                            {recipe.available_ingredients.length} Pantry
                            Ingredients Ready
                          </span>
                          <span className="inline-flex items-center gap-1 text-forest font-bold">
                            <ScrollText size={13} /> Read Scroll →
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          /* ── Editorial Cards Grid View ── */
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {filtered.map((recipe, i) => {
                const emoji = EMOJIS[recipe.name] || "🍽";
                const photo = RECIPE_PHOTOS[i % RECIPE_PHOTOS.length];
                return (
                  <motion.div
                    key={recipe.name}
                    layout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                      delay: i * 0.05,
                      duration: 0.5,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <FloatingCard
                      intensity={4}
                      className="card overflow-hidden group flex flex-col h-full"
                    >
                      {/* Photographic Hero Header */}
                      <div className="relative h-44 flex items-center justify-center overflow-hidden">
                        <img
                          src={photo}
                          alt={recipe.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(to bottom, rgba(16,18,14,0.2) 0%, rgba(16,18,14,0.75) 100%)",
                          }}
                        />

                        {/* Floating Glass Emoji Emblem */}
                        <motion.div
                          animate={{ y: [0, -6, 0] }}
                          transition={{
                            duration: 3.2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center glass-dark shadow-lg"
                        >
                          <span className="text-4xl">{emoji}</span>
                        </motion.div>

                        <div className="absolute top-3.5 right-3.5 z-10">
                          {recipe.can_make ? (
                            <span className="px-3 py-1 rounded-full text-xs font-sans font-bold bg-emerald-900/80 text-emerald-200 border border-emerald-400/30 backdrop-blur-md">
                              ✅ Ready to Cook
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-sans font-bold bg-amber-900/80 text-amber-200 border border-amber-400/30 backdrop-blur-md">
                              🔧 Missing {recipe.missing_ingredients.length}
                            </span>
                          )}
                        </div>

                        <div className="absolute bottom-3 left-4 right-4 z-10 flex items-center justify-between text-white">
                          <div className="flex items-center gap-3 font-sans text-xs text-white/85">
                            <span className="flex items-center gap-1">
                              <Clock size={12} /> {recipe.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <Flame size={12} /> {recipe.difficulty}
                            </span>
                          </div>
                          <span className="font-sans text-xs font-bold text-amber-300">
                            {Math.round(recipe.match_score * 100)}% Match
                          </span>
                        </div>

                        {/* Animated match bar */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                          <motion.div
                            className="h-1"
                            initial={{ width: 0 }}
                            animate={{ width: `${recipe.match_score * 100}%` }}
                            transition={{
                              duration: 1,
                              delay: i * 0.06 + 0.2,
                              ease: "easeOut",
                            }}
                            style={{
                              background: recipe.can_make
                                ? "#4ADE80"
                                : "#FBBF24",
                            }}
                          />
                        </div>
                      </div>

                      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-display font-bold text-lg text-charcoal">
                              {recipe.name}
                            </h3>
                            <p className="font-sans text-xs text-charcoal/55 mt-0.5 leading-relaxed">
                              {recipe.description}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-sand/40">
                            <div>
                              <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-forest/70 mb-1.5">
                                In Pantry ({recipe.available_ingredients.length})
                              </p>
                              {recipe.available_ingredients.map((ing) => (
                                <div
                                  key={ing}
                                  className="flex items-center gap-1.5 font-sans text-xs text-charcoal/75 mb-1"
                                >
                                  <CheckCircle
                                    size={11}
                                    className="text-forest shrink-0"
                                  />
                                  {ing.charAt(0).toUpperCase() + ing.slice(1)}
                                </div>
                              ))}
                            </div>
                            {recipe.missing_ingredients.length > 0 && (
                              <div>
                                <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-warm/80 mb-1.5">
                                  Need ({recipe.missing_ingredients.length})
                                </p>
                                {recipe.missing_ingredients.map((ing) => (
                                  <div
                                    key={ing}
                                    className="flex items-center gap-1.5 font-sans text-xs text-charcoal/55 mb-1"
                                  >
                                    <XCircle
                                      size={11}
                                      className="text-warm/70 shrink-0"
                                    />
                                    {ing.charAt(0).toUpperCase() + ing.slice(1)}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() =>
                              setActiveScroll({ ...recipe, photo, emoji })
                            }
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 font-sans text-xs font-semibold rounded-2xl transition-all bg-sand/25 text-charcoal hover:bg-forest hover:text-white"
                          >
                            <ScrollText size={13} /> Open Recipe Scroll
                          </button>
                          {recipe.missing_ingredients.length > 0 && (
                            <button
                              onClick={() => addMissing(recipe)}
                              title="Add missing items to Shopping List"
                              className="flex items-center justify-center gap-1.5 py-2.5 px-3.5 font-sans text-xs font-semibold rounded-2xl transition-all text-warm border border-warm/30 hover:bg-warm hover:text-white"
                            >
                              <ShoppingCart size={13} /> +List
                            </button>
                          )}
                        </div>
                      </div>
                    </FloatingCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ── Interactive Parchment Scroll Modal (Uses scroll.jpg!) ── */}
      <AnimatePresence>
        {activeScroll && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveScroll(null)}
              className="absolute inset-0 bg-black/65 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scaleY: 0.25, y: 40 }}
              animate={{ opacity: 1, scaleY: 1, y: 0 }}
              exit={{ opacity: 0, scaleY: 0.3, y: 30 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              style={{ transformOrigin: "top center" }}
              className="relative w-full max-w-xl rounded-4xl overflow-hidden shadow-2xl border border-amber-200/30"
            >
              {/* Parchment Scroll Background Image */}
              <img
                src={FOOD_IMAGES.scroll}
                alt="Parchment scroll"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Warm translucent parchment overlay so text in center is ultra-legible */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at center, rgba(252,243,224,0.92) 0%, rgba(236,216,182,0.94) 68%, rgba(80,48,24,0.85) 100%)",
                }}
              />

              <div className="relative z-10 p-6 sm:p-9 max-h-[85dvh] overflow-y-auto space-y-5">
                <div className="flex items-start justify-between gap-4 border-b border-amber-900/15 pb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-amber-950/10 border border-amber-900/20 text-3xl shadow-inner">
                      {activeScroll.emoji}
                    </div>
                    <div>
                      <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-amber-900/60">
                        Chef's Parchment Manuscript
                      </span>
                      <h2 className="font-display text-2xl sm:text-3xl font-bold text-amber-950">
                        {activeScroll.name}
                      </h2>
                      <p className="font-sans text-xs text-amber-900/75 mt-0.5">
                        {activeScroll.time} · {activeScroll.difficulty} ·{" "}
                        {Math.round(activeScroll.match_score * 100)}% Pantry Match
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveScroll(null)}
                    className="p-2 rounded-xl bg-amber-950/10 hover:bg-amber-950/20 text-amber-950 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Ingredients Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-2xl p-3.5 bg-white/60 border border-amber-900/15">
                    <p className="font-sans text-xs font-bold uppercase tracking-wider text-forest mb-2">
                      ✓ Ready in Your Pantry
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {activeScroll.available_ingredients.map((ing) => (
                        <span
                          key={ing}
                          className="px-2.5 py-1 rounded-full text-xs font-sans font-semibold bg-forest/15 text-forest"
                        >
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl p-3.5 bg-white/60 border border-amber-900/15">
                    <p className="font-sans text-xs font-bold uppercase tracking-wider text-warm mb-2">
                      {activeScroll.missing_ingredients.length > 0
                        ? "Shopping Needed"
                        : "All Ingredients Stocked"}
                    </p>
                    {activeScroll.missing_ingredients.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {activeScroll.missing_ingredients.map((ing) => (
                          <span
                            key={ing}
                            className="px-2.5 py-1 rounded-full text-xs font-sans font-semibold bg-warm/15 text-amber-900"
                          >
                            {ing}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="font-sans text-xs text-amber-900/70">
                        You have everything required to cook this dish right now!
                      </p>
                    )}
                  </div>
                </div>

                {/* Culinary Preparation Steps */}
                <div className="space-y-3">
                  <h3 className="font-display font-bold text-base text-amber-950">
                    Culinary Method
                  </h3>
                  <div className="space-y-2.5">
                    {getCookingSteps(activeScroll).map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-2xl bg-white/55 border border-amber-900/10"
                      >
                        <span className="w-6 h-6 rounded-full bg-amber-900 text-amber-50 font-display font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="font-sans text-xs sm:text-sm text-amber-950/90 leading-relaxed">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-amber-900/15">
                  {activeScroll.missing_ingredients.length > 0 && (
                    <button
                      onClick={() => addMissing(activeScroll)}
                      className="btn-warm text-xs py-2.5 px-4"
                    >
                      <ShoppingCart size={14} /> Add Missing to Shopping List
                    </button>
                  )}
                  <button
                    onClick={() => setActiveScroll(null)}
                    className="btn-primary text-xs py-2.5 px-6"
                  >
                    Done Reading
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
