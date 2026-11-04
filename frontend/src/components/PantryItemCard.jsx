import React from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, ShoppingCart, Sparkles, Calendar } from "lucide-react";
import StatusBadge from "./ui/StatusBadge";
import FloatingCard from "./ui/FloatingCard";
import { format, parseISO, differenceInDays } from "date-fns";
import { CATEGORY_IMAGES } from "../assets/images";

const CAT_META = {
  Dairy:          { emoji: "🥛", accent: "#2D4A2D" },
  Fruits:         { emoji: "🍓", accent: "#C17B4A" },
  Vegetables:     { emoji: "🥦", accent: "#3A6B3A" },
  Snacks:         { emoji: "🌰", accent: "#8B5A2B" },
  Drinks:         { emoji: "🍊", accent: "#C17B4A" },
  "Frozen Foods": { emoji: "🫐", accent: "#2A5A8A" },
  Bakery:         { emoji: "🥖", accent: "#8B5A2B" },
  Meat:           { emoji: "🥩", accent: "#9B3B30" },
  Seafood:        { emoji: "🍤", accent: "#2A5A7A" },
  Grains:         { emoji: "🌾", accent: "#7A6A2A" },
  Other:          { emoji: "🫙", accent: "#5C4A3A" },
};

function fmtDate(s) {
  if (!s) return null;
  try {
    return format(parseISO(s.slice(0, 10)), "MMM d, yyyy");
  } catch {
    return s;
  }
}

function getFreshnessPercent(expiryStr, status) {
  if (status === "expired") return 10;
  if (status === "expiring_soon") return 38;
  if (!expiryStr) return 90;
  try {
    const days = differenceInDays(parseISO(expiryStr.slice(0, 10)), new Date());
    return Math.max(12, Math.min(100, Math.round((days / 14) * 100)));
  } catch {
    return 85;
  }
}

export default function PantryItemCard({ item, onEdit, onDelete, onShop }) {
  const cat = CAT_META[item.category] || CAT_META.Other;
  const fallbackBgImg = CATEGORY_IMAGES[item.category] || CATEGORY_IMAGES.Other;
  const bgImg = item.image_path || fallbackBgImg;
  const expFmt = fmtDate(item.expiry_date);
  const freshnessPct = getFreshnessPercent(item.expiry_date, item.status);

  return (
    <FloatingCard
      intensity={5}
      className="bg-white rounded-3xl overflow-hidden shadow-card border border-sand/40 transition-all duration-300 hover:shadow-card-md group"
    >
      {/* Photographic header with glassmorphism badge & floating emblem */}
      <div className="relative h-36 sm:h-40 overflow-hidden">
        <img
          src={bgImg}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          onError={(e) => {
            if (e.target.src !== fallbackBgImg) {
              e.target.src = fallbackBgImg;
            }
          }}
        />
        {/* Luxury editorial vignette */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background:
              "linear-gradient(to bottom, rgba(16,18,14,0.22) 0%, rgba(16,18,14,0.18) 45%, rgba(16,18,14,0.72) 100%)",
          }}
        />

        {/* Floating Glass Orb with Category Emoji */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
            style={{
              background: "rgba(255, 255, 255, 0.22)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.38)",
            }}
          >
            <span className="text-3xl drop-shadow">{cat.emoji}</span>
          </div>
        </motion.div>

        {/* Status badge — top right */}
        <div className="absolute top-3 right-3 z-10">
          <StatusBadge status={item.status} />
        </div>

        {/* Category pill — bottom left */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5">
          <span
            className="font-sans text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wide shadow-sm"
            style={{
              background: "rgba(255,253,249,0.92)",
              color: cat.accent,
              backdropFilter: "blur(8px)",
            }}
          >
            {item.category}
          </span>
        </div>

        {/* AI Confidence pill — bottom right */}
        {item.confidence > 0 && (
          <div className="absolute bottom-3 right-3 z-10">
            <span
              className="inline-flex items-center gap-1 font-sans text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
              style={{
                background: "rgba(45,74,45,0.82)",
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              <Sparkles size={9} /> {Math.round(item.confidence * 100)}% AI
            </span>
          </div>
        )}
      </div>

      {/* Content body */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-display font-bold text-base text-charcoal leading-snug truncate">
              {item.name}
            </h3>
            {item.brand ? (
              <p className="font-sans text-xs text-charcoal/45 mt-0.5 truncate">
                {item.brand}
              </p>
            ) : (
              <p className="font-sans text-xs text-charcoal/35 mt-0.5">
                Artisanal Stock
              </p>
            )}
          </div>
          <span
            className="shrink-0 font-sans text-xs font-bold px-2.5 py-1 rounded-xl"
            style={{ background: "rgba(212,197,169,0.25)", color: "#5C3D2E" }}
          >
            ×{item.quantity}
            {item.unit ? ` ${item.unit}` : ""}
          </span>
        </div>

        {/* Freshness Gauge & Expiry */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-sans">
            <span className="inline-flex items-center gap-1 text-charcoal/45">
              <Calendar size={11} /> {expFmt ? "Expires" : "Shelf Life"}
            </span>
            <span
              className="font-semibold"
              style={{
                color:
                  item.status === "expired"
                    ? "#9B3B30"
                    : item.status === "expiring_soon"
                    ? "#C17B4A"
                    : "#2D4A2D",
              }}
            >
              {expFmt || "Fresh Stock"}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full overflow-hidden bg-sand/30">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${freshnessPct}%` }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{
                background:
                  item.status === "expired"
                    ? "linear-gradient(90deg, #C17B4A, #9B3B30)"
                    : item.status === "expiring_soon"
                    ? "linear-gradient(90deg, #E8B890, #C17B4A)"
                    : "linear-gradient(90deg, #4A7A4A, #2D4A2D)",
              }}
            />
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-1.5 pt-1.5 border-t border-sand/30">
          {onShop && (
            <button
              onClick={() => onShop(item)}
              title="Add to shopping list"
              className="p-2 rounded-xl transition-all text-charcoal/40 hover:text-warm hover:bg-warm/10"
            >
              <ShoppingCart size={14} />
            </button>
          )}
          <button
            onClick={() => onEdit(item)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-sans font-semibold rounded-xl transition-all duration-200 text-charcoal/60 hover:text-forest hover:bg-forest/10"
          >
            <Pencil size={12} /> Edit
          </button>
          <button
            onClick={() => onDelete(item._id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-sans font-semibold rounded-xl transition-all duration-200 text-red-400/70 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 size={12} /> Remove
          </button>
        </div>
      </div>
    </FloatingCard>
  );
}
