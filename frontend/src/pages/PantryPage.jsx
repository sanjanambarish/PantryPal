import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { pantry as pantryApi, shopping as shoppingApi } from "../api/client";
import PantryItemCard from "../components/PantryItemCard";
import Modal from "../components/ui/Modal";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import ScrollReveal from "../components/ui/ScrollReveal";
import ParallaxImage from "../components/ui/ParallaxImage";
import AnimatedCounter from "../components/ui/AnimatedCounter";
import toast from "react-hot-toast";
import { Search, Plus, Package, SlidersHorizontal, Sparkles } from "lucide-react";
import { PAGE_HEROES, CATEGORY_IMAGES } from "../assets/images";

const CATS = [
  "All", "Dairy", "Fruits", "Vegetables", "Snacks", "Drinks",
  "Frozen Foods", "Bakery", "Meat", "Seafood", "Grains", "Other",
];
const STATUSES = ["All", "fresh", "expiring_soon", "expired"];

function ItemForm({ initial = {}, onSave, onCancel, loading }) {
  const [form, setForm] = useState({
    name: "",
    category: "Other",
    quantity: 1,
    unit: "",
    expiry_date: "",
    brand: "",
    notes: "",
    ...initial,
  });
  const h = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Product Name *</label>
          <input
            name="name"
            value={form.name}
            onChange={h}
            className="input"
            required
            placeholder="e.g. Organic Strawberries"
          />
        </div>
        <div>
          <label className="label">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={h}
            className="input"
          >
            {CATS.filter((c) => c !== "All").map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Brand / Origin</label>
          <input
            name="brand"
            value={form.brand}
            onChange={h}
            className="input"
            placeholder="Farmers Market"
          />
        </div>
        <div>
          <label className="label">Quantity</label>
          <input
            name="quantity"
            type="number"
            min={0}
            value={form.quantity}
            onChange={h}
            className="input"
          />
        </div>
        <div>
          <label className="label">Unit</label>
          <input
            name="unit"
            value={form.unit}
            onChange={h}
            className="input"
            placeholder="L, kg, pcs…"
          />
        </div>
        <div className="col-span-2">
          <label className="label">Expiry Date</label>
          <input
            name="expiry_date"
            type="date"
            value={form.expiry_date}
            onChange={h}
            className="input"
          />
        </div>
        <div className="col-span-2">
          <label className="label">Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={h}
            className="input"
            rows={2}
            placeholder="Storage tips or recipe ideas…"
          />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-outline flex-1">
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex-1 h-11"
        >
          {loading ? "Saving…" : "Save Ingredient"}
        </button>
      </div>
    </form>
  );
}

export default function PantryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [statusF, setStatusF] = useState("All");
  const [sortBy, setSortBy] = useState("date_added");
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const r = await pantryApi.list();
      setItems(r.data);
    } catch {
      toast.error("Could not load pantry.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    let l = [...items];
    if (search)
      l = l.filter(
        (i) =>
          i.name.toLowerCase().includes(search.toLowerCase()) ||
          i.brand?.toLowerCase().includes(search.toLowerCase())
      );
    if (category !== "All") l = l.filter((i) => i.category === category);
    if (statusF !== "All") l = l.filter((i) => i.status === statusF);
    l.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "expiry_date")
        return (a.expiry_date || "9999").localeCompare(b.expiry_date || "9999");
      if (sortBy === "status")
        return (
          ({ expired: 0, expiring_soon: 1, fresh: 2 }[a.status] ?? 2) -
          ({ expired: 0, expiring_soon: 1, fresh: 2 }[b.status] ?? 2)
        );
      return (b.created_at || "").localeCompare(a.created_at || "");
    });
    return l;
  }, [items, search, category, statusF, sortBy]);

  const handleAdd = async (d) => {
    setSaving(true);
    try {
      await pantryApi.create(d);
      toast.success("Ingredient added!");
      setModal(null);
      load();
    } catch {
      toast.error("Could not add.");
    } finally {
      setSaving(false);
    }
  };
  const handleEdit = async (d) => {
    setSaving(true);
    try {
      await pantryApi.update(modal.edit._id, d);
      toast.success("Updated!");
      setModal(null);
      load();
    } catch {
      toast.error("Could not update.");
    } finally {
      setSaving(false);
    }
  };
  const handleDel = async (id) => {
    if (!confirm("Remove this item?")) return;
    try {
      await pantryApi.delete(id);
      toast.success("Removed.");
      setItems((p) => p.filter((i) => i._id !== id));
    } catch {
      toast.error("Could not delete.");
    }
  };
  const handleShop = async (item) => {
    try {
      await shoppingApi.add({
        name: item.name,
        quantity: item.quantity,
        reason: "manual",
      });
      toast.success(`${item.name} added to shopping list!`);
    } catch {
      toast.error("Could not add.");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );

  const activeHeroImg =
    category === "All"
      ? PAGE_HEROES.pantry
      : CATEGORY_IMAGES[category] || PAGE_HEROES.pantry;

  return (
    <div className="space-y-0 -mx-4 md:-mx-8 -mt-6 md:-mt-8">
      {/* ── Dynamic Category Parallax Hero ── */}
      <ParallaxImage
        src={activeHeroImg}
        alt="Fresh pantry harvest"
        height="h-60 sm:h-72"
        overlayStyle={{
          background:
            "linear-gradient(to bottom, rgba(14,18,14,0.2) 0%, rgba(18,20,16,0.82) 100%)",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-dark text-amber-200 text-xs font-sans font-bold uppercase tracking-widest mb-2">
              <Sparkles size={11} />{" "}
              {category === "All" ? "Complete Collection" : category}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">
              My Artisanal Pantry
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-sans font-semibold glass-dark text-white">
                <AnimatedCounter value={items.length} /> Total Stock
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-sans font-semibold glass-dark text-emerald-300">
                <AnimatedCounter
                  value={items.filter((i) => i.status === "fresh").length}
                />{" "}
                Fresh
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-sans font-semibold glass-dark text-amber-300">
                <AnimatedCounter
                  value={
                    items.filter((i) => i.status === "expiring_soon").length
                  }
                />{" "}
                Expiring Soon
              </span>
            </div>
          </motion.div>

          <button
            onClick={() => setModal("add")}
            className="btn-primary h-11 px-5 self-start sm:self-end shrink-0 shadow-lg"
          >
            <Plus size={15} /> Add Ingredient
          </button>
        </div>
      </ParallaxImage>

      <div className="px-4 md:px-8 space-y-6 pt-6">
        {/* ── Photographic Category Strip ── */}
        <ScrollReveal variant="fadeUp">
          <div
            className="flex gap-2.5 overflow-x-auto pb-2"
            style={{ scrollbarWidth: "none" }}
          >
            {CATS.map((c) => {
              const active = category === c;
              const img = CATEGORY_IMAGES[c] || CATEGORY_IMAGES.Other;
              return (
                <motion.button
                  key={c}
                  onClick={() => setCategory(c)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className={`flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-full font-sans text-xs font-bold whitespace-nowrap transition-all shrink-0 border ${
                    active
                      ? "bg-forest text-white border-forest shadow-forest"
                      : "bg-white text-charcoal/70 border-sand/50 hover:border-forest/40"
                  }`}
                >
                  <img
                    src={img}
                    alt={c}
                    className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/40"
                  />
                  <span>{c}</span>
                </motion.button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* ── Search & Status Filter Bar ── */}
        <ScrollReveal variant="fadeUp">
          <div className="card p-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/35"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input pl-9"
                  placeholder="Search ingredients, brands, or notes…"
                />
              </div>
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-charcoal/40" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input py-2.5 px-3 text-xs w-auto"
                >
                  <option value="date_added">Newest First</option>
                  <option value="name">Name A–Z</option>
                  <option value="expiry_date">Expiry Date</option>
                  <option value="status">Freshness Status</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap items-center justify-between pt-1">
              <div className="flex gap-1.5 flex-wrap">
                {STATUSES.map((s) => (
                  <motion.button
                    key={s}
                    onClick={() => setStatusF(s)}
                    whileTap={{ scale: 0.95 }}
                    className="font-sans px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150"
                    style={
                      statusF === s
                        ? {
                            background: "#2D4A2D",
                            color: "#fff",
                            boxShadow: "0 2px 8px rgba(45,74,45,0.25)",
                          }
                        : {
                            background: "rgba(212,197,169,0.2)",
                            color: "#7A7060",
                            border: "1px solid rgba(212,197,169,0.4)",
                          }
                    }
                  >
                    {s === "expiring_soon"
                      ? "Expiring Soon"
                      : s === "All"
                      ? "All Statuses"
                      : s.charAt(0).toUpperCase() + s.slice(1)}
                  </motion.button>
                ))}
              </div>
              <p className="font-sans text-xs font-medium text-charcoal/45">
                Showing {filtered.length} of {items.length} ingredients
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Pantry Grid with AnimatePresence ── */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={Package}
            title={
              items.length === 0
                ? "Your pantry is empty"
                : "No ingredients match your filters"
            }
            description={
              items.length === 0
                ? "Add items manually or scan your fridge with AI."
                : "Try selecting 'All' categories or clearing your search."
            }
            action={
              items.length === 0 && (
                <button
                  onClick={() => setModal("add")}
                  className="btn-primary"
                >
                  Add First Ingredient
                </button>
              )
            }
          />
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            <AnimatePresence>
              {filtered.map((item, i) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, scale: 0.92, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.88, y: -10 }}
                  transition={{
                    duration: 0.35,
                    delay: i * 0.03,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <PantryItemCard
                    item={item}
                    onEdit={(it) => setModal({ edit: it })}
                    onDelete={handleDel}
                    onShop={handleShop}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <Modal
        open={modal === "add"}
        onClose={() => setModal(null)}
        title="Add Pantry Ingredient"
      >
        <ItemForm
          onSave={handleAdd}
          onCancel={() => setModal(null)}
          loading={saving}
        />
      </Modal>
      <Modal
        open={!!modal?.edit}
        onClose={() => setModal(null)}
        title="Edit Pantry Ingredient"
      >
        {modal?.edit && (
          <ItemForm
            initial={modal.edit}
            onSave={handleEdit}
            onCancel={() => setModal(null)}
            loading={saving}
          />
        )}
      </Modal>
    </div>
  );
}
