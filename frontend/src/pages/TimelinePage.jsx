import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { scan as scanApi } from "../api/client";
import Spinner from "../components/ui/Spinner";
import EmptyState from "../components/ui/EmptyState";
import ParallaxImage from "../components/ui/ParallaxImage";
import ScrollReveal from "../components/ui/ScrollReveal";
import { Clock, Plus, Minus, ScanLine, Sparkles } from "lucide-react";
import { format, parseISO } from "date-fns";
import { PAGE_HEROES, FOOD_IMAGES } from "../assets/images";

const FALLBACK_THUMBS = [
  FOOD_IMAGES.woodtable,
  FOOD_IMAGES.harvest,
  FOOD_IMAGES.veggies,
  FOOD_IMAGES.fruits,
];

export default function TimelinePage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    scanApi
      .history()
      .then((r) => setSessions(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );

  return (
    <div className="-mx-4 md:-mx-8 -mt-6 md:-mt-8 space-y-0">
      {/* ── Parallax Hero with Foliage Frame ── */}
      <ParallaxImage
        src={PAGE_HEROES.timeline}
        alt="Dark wood framed with lush foliage"
        height="h-60 sm:h-72"
        overlayStyle={{
          background:
            "linear-gradient(to bottom, rgba(12,18,12,0.2) 0%, rgba(16,22,16,0.86) 100%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-2"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-dark text-emerald-300 text-xs font-sans font-bold uppercase tracking-widest">
            <Sparkles size={11} /> Chronological Ledger
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">
            Pantry Evolution Timeline
          </h1>
          <p className="font-sans text-sm text-white/80 max-w-lg">
            Every AI scan and inventory milestone recorded in your kitchen's
            living history.
          </p>
        </motion.div>
      </ParallaxImage>

      <div className="max-w-3xl mx-auto px-4 md:px-8 pt-8 space-y-6">
        {sessions.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No scan history yet"
            description="Scan your pantry or groceries to start building a visual timeline."
            action={
              <a href="/scan" className="btn-primary">
                Launch AI Scanner
              </a>
            }
          />
        ) : (
          <div className="relative">
            {/* Timeline vertical stem */}
            <div
              className="absolute left-[19px] top-4 bottom-4 w-0.5"
              style={{
                background:
                  "linear-gradient(to bottom, #2D4A2D, #C17B4A, transparent)",
              }}
            />

            <div className="space-y-6 pl-12">
              {sessions.map((session, idx) => {
                const added = session.changes?.added || [];
                const removed = session.changes?.removed || [];
                const dateStr = session.created_at
                  ? format(
                      parseISO(session.created_at),
                      "MMMM d, yyyy · h:mm a"
                    )
                  : "Recent Scan";
                const fallbackImg =
                  FALLBACK_THUMBS[idx % FALLBACK_THUMBS.length];
                return (
                  <ScrollReveal
                    key={session._id || idx}
                    variant="fadeUp"
                    delay={idx * 0.06}
                  >
                    <div className="relative">
                      {/* Node */}
                      <div
                        className="absolute -left-[35px] w-9 h-9 rounded-2xl flex items-center justify-center bg-white border-2 shadow-card"
                        style={{ borderColor: "#2D4A2D" }}
                      >
                        <ScanLine size={14} style={{ color: "#2D4A2D" }} />
                      </div>

                      <div className="card p-5 sm:p-6 space-y-4 hover:shadow-card-md transition-shadow">
                        {/* Header */}
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div>
                            <p className="font-display font-bold text-base text-charcoal">
                              AI Vision Scan #{sessions.length - idx}
                            </p>
                            <p className="font-sans text-xs text-charcoal/45 mt-0.5">
                              {dateStr}
                            </p>
                          </div>
                          <span className="font-sans text-xs font-bold px-3 py-1 rounded-full bg-forest/10 text-forest">
                            {session.item_count} ingredients logged
                          </span>
                        </div>

                        {/* Preview */}
                        <div className="relative h-36 rounded-2xl overflow-hidden bg-sand/20">
                          <img
                            src={session.image_path || fallbackImg}
                            alt="Scan snapshot"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              if (e.target.src !== fallbackImg) {
                                e.target.src = fallbackImg;
                              }
                            }}
                          />
                          <div
                            className="absolute inset-0"
                            style={{
                              background:
                                "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)",
                            }}
                          />
                        </div>

                        {/* Diff */}
                        {(added.length > 0 || removed.length > 0) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {added.length > 0 && (
                              <div
                                className="rounded-2xl p-3.5"
                                style={{
                                  background: "rgba(45,74,45,0.06)",
                                  border: "1px solid rgba(45,74,45,0.14)",
                                }}
                              >
                                <p
                                  className="font-sans text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1"
                                  style={{ color: "#2D4A2D" }}
                                >
                                  <Plus size={11} /> Added ({added.length})
                                </p>
                                {added.map((n) => (
                                  <p
                                    key={n}
                                    className="font-sans text-xs font-semibold"
                                    style={{ color: "#2D4A2D" }}
                                  >
                                    + {n}
                                  </p>
                                ))}
                              </div>
                            )}
                            {removed.length > 0 && (
                              <div
                                className="rounded-2xl p-3.5"
                                style={{
                                  background: "rgba(155,59,48,0.05)",
                                  border: "1px solid rgba(155,59,48,0.14)",
                                }}
                              >
                                <p
                                  className="font-sans text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1"
                                  style={{ color: "#9B3B30" }}
                                >
                                  <Minus size={11} /> Consumed / Removed (
                                  {removed.length})
                                </p>
                                {removed.map((n) => (
                                  <p
                                    key={n}
                                    className="font-sans text-xs font-medium line-through"
                                    style={{ color: "#9B3B30" }}
                                  >
                                    − {n}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Item tags */}
                        {session.detected_items?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {session.detected_items.map((item, i) => (
                              <span
                                key={i}
                                className="font-sans text-xs font-medium px-3 py-1 rounded-full bg-sand/25 text-charcoal/75"
                              >
                                {item.name}
                                {item.quantity > 1 && (
                                  <span className="opacity-60">
                                    {" "}
                                    ×{item.quantity}
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
