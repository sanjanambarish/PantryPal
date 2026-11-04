import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { shopping as shoppingApi } from "../api/client";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import ParallaxImage from "../components/ui/ParallaxImage";
import ScrollReveal from "../components/ui/ScrollReveal";
import toast from "react-hot-toast";
import { ShoppingCart, Plus, Trash2, Check, Wand2, Sparkles } from "lucide-react";
import { PAGE_HEROES, FOOD_IMAGES } from "../assets/images";

const QUICK_STAPLES = [
  { name: "Heirloom Tomatoes", img: FOOD_IMAGES.veggies },
  { name: "Fresh Berries", img: FOOD_IMAGES.fruits },
  { name: "Organic Garlic & Ginger", img: FOOD_IMAGES.earthy },
  { name: "Rosemary & Citrus", img: FOOD_IMAGES.sunlit },
  { name: "Whole Spices", img: FOOD_IMAGES.spices },
];

export default function ShoppingListPage() {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState("");
  const [newQty, setNewQty] = useState(1);
  const [generating, setGen] = useState(false);

  const load = async () => {
    try {
      const r = await shoppingApi.list();
      setDoc(r.data);
    } catch {
      toast.error("Could not load.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const toggle = async (item) => {
    const items = doc.items.map((i) =>
      i.id === item.id ? { ...i, checked: !i.checked } : i
    );
    setDoc({ ...doc, items });
    try {
      await shoppingApi.update({ items });
    } catch {
      load();
    }
  };
  const remove = async (id) => {
    try {
      const r = await shoppingApi.remove(id);
      setDoc(r.data);
      toast.success("Removed.");
    } catch {
      toast.error("Could not remove.");
    }
  };
  const add = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    setAdding(true);
    try {
      const r = await shoppingApi.add({
        name: newItem.trim(),
        quantity: newQty,
      });
      setDoc(r.data);
      setNewItem("");
      setNewQty(1);
    } catch {
      toast.error("Could not add.");
    } finally {
      setAdding(false);
    }
  };
  const quickAdd = async (name) => {
    try {
      const r = await shoppingApi.add({ name, quantity: 1 });
      setDoc(r.data);
      toast.success(`Added ${name}!`);
    } catch {
      toast.error("Could not add.");
    }
  };
  const gen = async () => {
    setGen(true);
    try {
      const r = await shoppingApi.generate();
      setDoc(r.data.list);
      toast.success(r.data.message);
    } catch {
      toast.error("Failed.");
    } finally {
      setGen(false);
    }
  };
  const clrDone = async () => {
    const items = doc.items.filter((i) => !i.checked);
    setDoc({ ...doc, items });
    try {
      await shoppingApi.update({ items });
      toast.success("Cleared completed items.");
    } catch {
      load();
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );

  const items = doc?.items || [];
  const unchecked = items.filter((i) => !i.checked);
  const checked = items.filter((i) => i.checked);

  return (
    <div className="-mx-4 md:-mx-8 -mt-6 md:-mt-8 space-y-0">
      {/* ── Parallax Hero with Red/White S-Curve Bowls ── */}
      <ParallaxImage
        src={PAGE_HEROES.shopping}
        alt="Curated culinary bowls on red and white split"
        height="h-60 sm:h-72"
        overlayStyle={{
          background:
            "linear-gradient(to bottom, rgba(24,10,10,0.2) 0%, rgba(32,12,12,0.85) 100%)",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-dark text-amber-200 text-xs font-sans font-bold uppercase tracking-widest mb-2">
              <Sparkles size={11} /> Smart Restock
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">
              Curated Shopping List
            </h1>
            <p className="font-sans text-sm text-white/80 mt-1">
              {unchecked.length} item{unchecked.length !== 1 ? "s" : ""} to
              pick up · {checked.length} completed
            </p>
          </motion.div>

          <button
            onClick={gen}
            disabled={generating}
            className="btn-warm text-xs h-11 px-5 self-start sm:self-end shrink-0 shadow-lg"
          >
            <Wand2 size={14} />
            {generating ? "Generating…" : "Auto-Fill from Expiring"}
          </button>
        </div>
      </ParallaxImage>

      <div className="max-w-2xl mx-auto px-4 md:px-8 pt-7 space-y-6">
        {/* ── Quick-Add Photographic Staples ── */}
        <ScrollReveal variant="fadeUp">
          <div className="space-y-2">
            <p className="font-sans text-[11px] font-bold uppercase tracking-widest text-charcoal/40">
              One-Tap Market Staples
            </p>
            <div
              className="flex gap-2 overflow-x-auto pb-1"
              style={{ scrollbarWidth: "none" }}
            >
              {QUICK_STAPLES.map((st) => (
                <motion.button
                  key={st.name}
                  type="button"
                  onClick={() => quickAdd(st.name)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2 pl-1.5 pr-3.5 py-1.5 rounded-full bg-white border border-sand/50 shadow-sm hover:border-forest/40 transition-all shrink-0"
                >
                  <img
                    src={st.img}
                    alt={st.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="font-sans text-xs font-semibold text-charcoal/80">
                    + {st.name}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ── Add Form ── */}
        <ScrollReveal variant="fadeUp">
          <form onSubmit={add} className="card flex gap-2 p-2.5 shadow-card-md">
            <input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              className="flex-1 font-sans text-sm px-3.5 py-2.5 bg-transparent border-none outline-none placeholder:text-charcoal/35 text-charcoal"
              placeholder="Add an ingredient to your market run…"
            />
            <input
              type="number"
              min={1}
              value={newQty}
              onChange={(e) => setNewQty(parseInt(e.target.value) || 1)}
              className="w-16 font-sans text-sm font-semibold text-center rounded-xl border border-sand/50 bg-cream/60 text-charcoal/80 outline-none py-2"
            />
            <button
              type="submit"
              disabled={adding}
              className="btn-primary px-5 h-11 shrink-0"
            >
              <Plus size={16} /> Add
            </button>
          </form>
        </ScrollReveal>

        {/* ── Checklist Card ── */}
        {items.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="Your shopping list is empty"
            description="Tap a market staple above or click Auto-Fill to restock expiring items."
          />
        ) : (
          <div className="card overflow-hidden shadow-card-md">
            <AnimatePresence>
              {unchecked.map((item, idx) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  className="flex items-center gap-3.5 px-5 py-4 hover:bg-cream/60 transition-colors"
                  style={{
                    borderBottom:
                      idx < unchecked.length - 1 || checked.length > 0
                        ? "1px solid rgba(212,197,169,0.4)"
                        : "none",
                  }}
                >
                  <button
                    onClick={() => toggle(item)}
                    className="w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-all hover:border-forest hover:scale-110"
                    style={{ borderColor: "rgba(193,123,74,0.6)" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-sm text-charcoal truncate">
                      {item.name}
                    </p>
                    {item.reason && item.reason !== "manual" && (
                      <p className="font-sans text-xs text-warm font-medium truncate">
                        {item.reason}
                      </p>
                    )}
                  </div>
                  <span className="font-sans text-xs font-bold px-2.5 py-1 rounded-xl bg-sand/25 text-charcoal/65 tabular-nums">
                    ×{item.quantity}
                  </span>
                  <button
                    onClick={() => remove(item.id)}
                    className="p-1.5 rounded-xl text-charcoal/25 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Checked Section */}
            {checked.length > 0 && (
              <>
                <div
                  className="flex items-center justify-between px-5 py-3 bg-cream/70"
                  style={{ borderTop: "1px solid rgba(212,197,169,0.4)" }}
                >
                  <p className="font-sans text-xs font-bold uppercase tracking-widest text-charcoal/40">
                    In Basket ({checked.length})
                  </p>
                  <button
                    onClick={clrDone}
                    className="font-sans text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                  >
                    Clear Completed
                  </button>
                </div>
                {checked.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3.5 px-5 py-3.5 opacity-55"
                    style={{
                      borderBottom:
                        idx < checked.length - 1
                          ? "1px solid rgba(212,197,169,0.3)"
                          : "none",
                    }}
                  >
                    <button
                      onClick={() => toggle(item)}
                      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: "rgba(45,74,45,0.15)",
                        border: "2px solid rgba(45,74,45,0.35)",
                      }}
                    >
                      <Check size={12} style={{ color: "#2D4A2D" }} />
                    </button>
                    <p className="flex-1 font-sans text-sm text-charcoal/60 line-through truncate">
                      {item.name}
                    </p>
                    <span className="font-sans text-xs text-charcoal/35 tabular-nums">
                      ×{item.quantity}
                    </span>
                    <button
                      onClick={() => remove(item.id)}
                      className="p-1.5 text-charcoal/20 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
