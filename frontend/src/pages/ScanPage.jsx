import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { scan as scanApi } from "../api/client";
import toast from "react-hot-toast";
import Spinner from "../components/ui/Spinner";
import StatusBadge from "../components/ui/StatusBadge";
import ParallaxImage from "../components/ui/ParallaxImage";
import ScrollReveal from "../components/ui/ScrollReveal";
import {
  Upload, Trash2, Plus, CheckCircle, RefreshCw,
  Sparkles, ScanLine, Camera, ShieldCheck
} from "lucide-react";
import { PAGE_HEROES, FOOD_IMAGES } from "../assets/images";

const CATS = [
  "Dairy", "Fruits", "Vegetables", "Snacks", "Drinks",
  "Frozen Foods", "Bakery", "Meat", "Seafood", "Grains", "Other",
];

export default function ScanPage() {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const onDrop = useCallback((accepted) => {
    const f = accepted[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setItems([]);
    setSaved(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png", ".webp"] },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024,
  });

  const scan = async () => {
    if (!file) {
      toast.error("Upload an image first.");
      return;
    }
    setScanning(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const r = await scanApi.upload(fd);
      setResult(r.data);
      setItems(r.data.detected_items.map((it, i) => ({ ...it, _key: i })));
      toast.success(`Detected ${r.data.item_count} items!`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Scan failed.");
    } finally {
      setScanning(false);
    }
  };

  const upd = (key, f, v) =>
    setItems((p) => p.map((i) => (i._key === key ? { ...i, [f]: v } : i)));
  const rem = (key) => setItems((p) => p.filter((i) => i._key !== key));
  const add = () =>
    setItems((p) => [
      ...p,
      {
        _key: Date.now(),
        name: "",
        category: "Other",
        quantity: 1,
        expiry_date: "",
        confidence: 0,
        status: "fresh",
      },
    ]);

  const confirm = async () => {
    const valid = items.filter((i) => i.name.trim());
    if (!valid.length) {
      toast.error("Add at least one item.");
      return;
    }
    setSaving(true);
    try {
      await scanApi.confirm({ items: valid, image_url: result?.image_url || "" });
      toast.success("Pantry updated!");
      setSaved(true);
    } catch {
      toast.error("Could not save.");
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setPreview(null);
    setFile(null);
    setResult(null);
    setItems([]);
    setSaved(false);
  };

  return (
    <div className="-mx-4 md:-mx-8 -mt-6 md:-mt-8 space-y-0">
      {/* ── Parallax Studio Hero with Levitating Salad ── */}
      <ParallaxImage
        src={PAGE_HEROES.scan}
        alt="Levitating fresh ingredients in studio lighting"
        height="h-64 sm:h-72"
        overlayStyle={{
          background:
            "linear-gradient(to bottom, rgba(10,12,10,0.25) 0%, rgba(12,16,12,0.88) 100%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-2"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-dark text-emerald-300 text-xs font-sans font-bold uppercase tracking-widest">
            <ScanLine size={12} /> Neural Vision Engine
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">
            AI Pantry Scanner
          </h1>
          <p className="font-sans text-sm text-white/80 max-w-lg">
            Snap a photo of your fridge shelves, countertop harvest, or grocery
            haul. Our vision model detects items and OCRs expiry dates.
          </p>
        </motion.div>
      </ParallaxImage>

      <div className="max-w-3xl mx-auto px-4 md:px-8 pt-8 space-y-6">
        {/* ── Interactive Viewfinder Dropzone ── */}
        {!saved && (
          <ScrollReveal variant="scaleUp">
            <div
              {...getRootProps()}
              className="relative rounded-4xl overflow-hidden cursor-pointer transition-all duration-300 shadow-card-md group"
              style={{
                border: `2px dashed ${
                  isDragActive ? "#2D4A2D" : "rgba(212,197,169,0.85)"
                }`,
                background: isDragActive ? "rgba(45,74,45,0.06)" : "#FEFCF8",
              }}
            >
              <input {...getInputProps()} />

              {/* Corner Viewfinder Reticles */}
              <div className="absolute top-5 left-5 w-6 h-6 border-t-2 border-l-2 border-forest/40 rounded-tl-lg pointer-events-none z-20" />
              <div className="absolute top-5 right-5 w-6 h-6 border-t-2 border-r-2 border-forest/40 rounded-tr-lg pointer-events-none z-20" />
              <div className="absolute bottom-5 left-5 w-6 h-6 border-b-2 border-l-2 border-forest/40 rounded-bl-lg pointer-events-none z-20" />
              <div className="absolute bottom-5 right-5 w-6 h-6 border-b-2 border-r-2 border-forest/40 rounded-br-lg pointer-events-none z-20" />

              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full max-h-80 object-contain"
                    style={{ background: "#141614" }}
                  />
                  {/* Animated Laser Scan Beam while scanning */}
                  {scanning && (
                    <div
                      className="absolute left-0 right-0 h-1 animate-scan-beam pointer-events-none z-20"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, #4ADE80, #fff, #4ADE80, transparent)",
                        boxShadow: "0 0 24px 4px rgba(74, 222, 128, 0.7)",
                      }}
                    />
                  )}
                  {!scanning && (
                    <div
                      className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                      style={{
                        background: "rgba(20,24,20,0.55)",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      <div className="text-center text-white">
                        <RefreshCw
                          size={24}
                          className="mx-auto mb-2 opacity-90"
                        />
                        <p className="font-sans text-sm font-semibold">
                          Click or drop to replace image
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative flex flex-col items-center py-14 px-6 text-center overflow-hidden">
                  {/* Subtle decorative food previews in background */}
                  <div className="flex items-center justify-center -space-x-3 mb-5">
                    {[
                      FOOD_IMAGES.veggies,
                      FOOD_IMAGES.cookingpan,
                      FOOD_IMAGES.fruits,
                    ].map((img, i) => (
                      <motion.div
                        key={img}
                        animate={{ y: [0, i % 2 === 0 ? -6 : 6, 0] }}
                        transition={{
                          duration: 3.5 + i * 0.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-md"
                      >
                        <img
                          src={img}
                          alt="Sample food"
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    ))}
                  </div>

                  <div
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-sans font-bold mb-3"
                    style={{
                      background: "rgba(45,74,45,0.1)",
                      color: "#2D4A2D",
                    }}
                  >
                    <Camera size={13} /> Ready for Visual Capture
                  </div>

                  <p className="font-display font-bold text-xl text-charcoal mb-1">
                    {isDragActive
                      ? "Release to scan your ingredients!"
                      : "Drop your pantry or grocery photo here"}
                  </p>
                  <p className="font-sans text-sm text-charcoal/45 max-w-md">
                    or click to browse from your device · Supports JPG, PNG &
                    WebP up to 20 MB
                  </p>
                </div>
              )}
            </div>
          </ScrollReveal>
        )}

        {/* ── Scan Trigger Button ── */}
        {preview && !result && !saved && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={scan}
            disabled={scanning}
            className="btn-primary w-full h-13 text-base shadow-forest"
          >
            {scanning ? (
              <>
                <Spinner size="sm" className="border-white/30 border-t-white" />
                Running AI Object & Expiry OCR Analysis…
              </>
            ) : (
              <>
                <Sparkles size={17} /> Analyze Ingredients with AI
              </>
            )}
          </motion.button>
        )}

        {/* ── Detected Items Review Panel ── */}
        <AnimatePresence>
          {result && !saved && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="card p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-sand/40 pb-4">
                <div>
                  <span className="section-label">Verification</span>
                  <h2 className="font-display font-bold text-xl text-charcoal">
                    Review Detected Ingredients
                  </h2>
                  <p className="font-sans text-xs text-charcoal/45 mt-0.5">
                    {items.length} item(s) identified — refine quantities or
                    expiry dates before saving
                  </p>
                </div>
                <button
                  onClick={add}
                  className="btn-outline text-xs py-2 px-3.5 gap-1.5"
                >
                  <Plus size={13} /> Add Manual Row
                </button>
              </div>

              {result.ocr_data?.expiry_date && (
                <div
                  className="rounded-2xl px-4 py-3 text-sm font-sans flex items-center gap-2.5"
                  style={{
                    background: "rgba(45,74,45,0.08)",
                    color: "#2D4A2D",
                    border: "1px solid rgba(45,74,45,0.2)",
                  }}
                >
                  <ShieldCheck size={16} />
                  <span>
                    OCR detected label expiry:{" "}
                    <strong>{result.ocr_data.expiry_date}</strong>
                    {result.ocr_data.product_name &&
                      ` · ${result.ocr_data.product_name}`}
                  </span>
                </div>
              )}

              <div className="space-y-3 max-h-[52vh] overflow-y-auto pr-1">
                {items.map((item) => (
                  <motion.div
                    key={item._key}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-3xl p-4 space-y-3 border border-sand/50 shadow-sm"
                    style={{ background: "#FEFCF8" }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.confidence > 0 && (
                          <span
                            className="font-sans text-xs font-semibold px-2.5 py-0.5 rounded-full"
                            style={{
                              background: "rgba(45,74,45,0.1)",
                              color: "#2D4A2D",
                            }}
                          >
                            <Sparkles size={10} className="inline mr-1" />
                            {Math.round(item.confidence * 100)}% AI confidence
                          </span>
                        )}
                        <StatusBadge status={item.status || "fresh"} />
                      </div>
                      <button
                        onClick={() => rem(item._key)}
                        className="p-1.5 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="col-span-2 sm:col-span-1">
                        <label className="label">Name</label>
                        <input
                          value={item.name}
                          onChange={(e) =>
                            upd(item._key, "name", e.target.value)
                          }
                          className="input text-sm"
                          placeholder="e.g. Heirloom Tomatoes"
                        />
                      </div>
                      <div>
                        <label className="label">Category</label>
                        <select
                          value={item.category}
                          onChange={(e) =>
                            upd(item._key, "category", e.target.value)
                          }
                          className="input text-sm"
                        >
                          {CATS.map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="label">Qty</label>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            upd(
                              item._key,
                              "quantity",
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="input text-sm"
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="label">Expiry Date</label>
                        <input
                          type="date"
                          value={item.expiry_date || ""}
                          onChange={(e) =>
                            upd(item._key, "expiry_date", e.target.value)
                          }
                          className="input text-sm"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={reset} className="btn-outline flex-1">
                  Start Over
                </button>
                <button
                  onClick={confirm}
                  disabled={saving}
                  className="btn-primary flex-1 h-12"
                >
                  {saving ? (
                    <>
                      <Spinner
                        size="sm"
                        className="border-white/30 border-t-white"
                      />{" "}
                      Saving to Pantry…
                    </>
                  ) : (
                    "Confirm & Add to Pantry"
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Saved Celebration Card ── */}
        {saved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-4xl overflow-hidden shadow-card-lg p-12 flex flex-col items-center gap-5 text-center"
          >
            <img
              src={FOOD_IMAGES.harvest}
              alt="Harvest"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle, rgba(20,32,20,0.82) 0%, rgba(14,20,14,0.92) 100%)",
              }}
            />
            <div className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center bg-emerald-500/20 border-2 border-emerald-400/40 backdrop-blur-md">
              <CheckCircle size={38} className="text-emerald-300" />
            </div>
            <div className="relative z-10">
              <h2 className="font-display text-2xl font-bold text-white">
                Pantry Inventory Updated!
              </h2>
              <p className="font-sans text-sm text-white/75 mt-1">
                Your scanned items and expiry dates are now tracked in real time.
              </p>
            </div>
            <div className="relative z-10 flex gap-3 pt-2">
              <button
                onClick={reset}
                className="px-5 py-2.5 rounded-2xl font-sans text-xs font-semibold glass-dark text-white hover:bg-white/20 transition-all"
              >
                Scan Another Photo
              </button>
              <a href="/pantry" className="btn-primary text-xs px-6 py-2.5">
                Explore My Pantry
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
