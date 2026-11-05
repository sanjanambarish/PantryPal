import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { couchdbInspector, pantry as pantryApi } from "../api/client";
import ParallaxImage from "../components/ui/ParallaxImage";
import ScrollReveal from "../components/ui/ScrollReveal";
import AnimatedCounter from "../components/ui/AnimatedCounter";
import {
  Database, Code2, Play, RefreshCw, ExternalLink,
  FileJson, Eye, Layers, Sparkles
} from "lucide-react";
import toast from "react-hot-toast";
import { FOOD_IMAGES } from "../assets/images";

const PRESET_QUERIES = [
  {
    label: "All Pantry Items",
    selector: { type: "pantry_item" },
  },
  {
    label: "Expiring Soon",
    selector: { type: "pantry_item", status: "expiring_soon" },
  },
  {
    label: "Fresh Dairy",
    selector: { type: "pantry_item", category: "Dairy", status: "fresh" },
  },
  {
    label: "Scan Sessions",
    selector: { type: "scan_session" },
  },
  {
    label: "Shopping List Doc",
    selector: { type: "shopping_list" },
  },
];

export default function CouchDBPage() {
  const [allDocs, setAllDocs] = useState({ total_rows: 0, rows: [] });
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [activeTab, setActiveTab] = useState("all_docs"); // "all_docs" | "views" | "mango"
  const [mangoInput, setMangoInput] = useState(
    JSON.stringify({ selector: { type: "pantry_item" } }, null, 2)
  );
  const [mangoResults, setMangoResults] = useState([]);

  const refresh = async () => {
    // Also sync with backend if local backend is running
    try {
      await pantryApi.list();
    } catch {}
    const res = couchdbInspector.getAllDocs();
    setAllDocs(res);
    if (!selectedDoc && res.rows.length > 0) {
      setSelectedDoc(res.rows[0].doc);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const runMango = () => {
    try {
      const parsed = JSON.parse(mangoInput);
      const sel = parsed.selector || parsed;
      const docs = couchdbInspector.runMangoQuery(sel);
      setMangoResults(docs);
      toast.success(`Mango query returned ${docs.length} document(s)`);
    } catch {
      toast.error("Invalid JSON in Mango selector");
    }
  };

  return (
    <div className="-mx-4 md:-mx-8 -mt-6 md:-mt-8 space-y-0">
      {/* ── Parallax Hero ── */}
      <ParallaxImage
        src={FOOD_IMAGES.earthy}
        alt="CouchDB NoSQL Document Store"
        height="h-60 sm:h-68"
        overlayStyle={{
          background:
            "linear-gradient(135deg, rgba(16,14,12,0.88) 0%, rgba(36,22,14,0.82) 100%)",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-dark text-amber-300 text-xs font-sans font-bold uppercase tracking-widest mb-2">
              <Database size={12} /> Apache CouchDB 3.3 · Document Store
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">
              CouchDB Fauxton Inspector
            </h1>
            <p className="font-sans text-sm text-white/80 max-w-xl mt-1">
              Live NoSQL JSON document store (<code>db: pantrypal</code>).
              Inspect <code>_id</code>, <code>_rev</code> MVCC revisions,{" "}
              <code>_design/pantry</code> MapReduce views, and run Mango queries.
            </p>
          </motion.div>

          <div className="flex items-center gap-2 self-start sm:self-end shrink-0">
            <a
              href="http://localhost:5984/_utils/#database/pantrypal/_all_docs"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-sans font-semibold glass-dark text-white hover:bg-white/20 transition-all"
            >
              Local :5984/_utils <ExternalLink size={12} />
            </a>
            <button
              onClick={() => {
                refresh();
                toast.success("Synced CouchDB documents!");
              }}
              className="btn-warm text-xs py-2.5 px-4"
            >
              <RefreshCw size={13} /> Refresh DB
            </button>
          </div>
        </div>
      </ParallaxImage>

      <div className="px-4 md:px-8 pt-6 space-y-6">
        {/* ── Database Telemetry Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Database Name", val: "pantrypal", isText: true },
            { label: "Total Documents", val: allDocs.total_rows },
            {
              label: "Design Views",
              val: 4,
              sub: "_design/pantry",
            },
            {
              label: "MVCC Engine",
              val: "Active",
              isText: true,
              sub: "_id + _rev",
            },
          ].map((st) => (
            <div key={st.label} className="card p-4">
              <p className="font-sans text-xs text-charcoal/45 font-semibold uppercase tracking-wider">
                {st.label}
              </p>
              <p className="font-display text-2xl font-black text-forest mt-1">
                {st.isText ? st.val : <AnimatedCounter value={st.val} />}
              </p>
              {st.sub && (
                <p className="font-mono text-xs text-warm mt-0.5">{st.sub}</p>
              )}
            </div>
          ))}
        </div>

        {/* ── Mode Tabs ── */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-sand/25 border border-sand/40 w-fit">
          {[
            { id: "all_docs", label: "_all_docs (JSON Documents)", icon: FileJson },
            { id: "views", label: "_design/pantry (MapReduce Views)", icon: Layers },
            { id: "mango", label: "_find (Mango Query Runner)", icon: Code2 },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-sans text-xs font-semibold transition-all ${
                activeTab === id
                  ? "bg-forest text-white shadow-sm"
                  : "text-charcoal/65 hover:text-charcoal"
              }`}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        {/* ── Tab 1: _all_docs Explorer ── */}
        {activeTab === "all_docs" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Document List */}
            <div className="lg:col-span-5 card overflow-hidden divide-y divide-sand/40 max-h-[540px] overflow-y-auto">
              <div className="px-4 py-3 bg-cream/80 flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-charcoal">
                  GET /pantrypal/_all_docs?include_docs=true
                </span>
                <span className="text-xs font-sans text-charcoal/50">
                  {allDocs.total_rows} docs
                </span>
              </div>
              {allDocs.rows.map((row) => {
                const isSelected = selectedDoc?._id === row.id;
                return (
                  <button
                    key={row.id}
                    onClick={() => setSelectedDoc(row.doc)}
                    className={`w-full text-left px-4 py-3 transition-colors flex items-start justify-between gap-2 ${
                      isSelected ? "bg-forest/10" : "hover:bg-cream/60"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-bold text-charcoal truncate">
                        {row.id}
                      </p>
                      <p className="font-sans text-xs text-charcoal/55 truncate mt-0.5">
                        {row.doc.type === "pantry_item"
                          ? `🥗 ${row.doc.name} (${row.doc.category})`
                          : row.doc.type === "scan_session"
                          ? `📸 Scan Session (${row.doc.item_count} items)`
                          : row.doc.type === "shopping_list"
                          ? `🛒 Shopping List (${row.doc.items?.length || 0} items)`
                          : "⚙️ CouchDB Design Document"}
                      </p>
                    </div>
                    <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-sand/30 text-charcoal/65 shrink-0">
                      {String(row.value.rev).slice(0, 10)}…
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Raw JSON Inspector */}
            <div className="lg:col-span-7 card overflow-hidden flex flex-col">
              <div className="px-5 py-3.5 bg-charcoal text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye size={14} className="text-amber-300" />
                  <span className="font-mono text-xs font-bold">
                    {selectedDoc?._id || "Select a document"}
                  </span>
                </div>
                {selectedDoc?._rev && (
                  <span className="font-mono text-xs text-emerald-300">
                    _rev: {selectedDoc._rev}
                  </span>
                )}
              </div>
              <pre className="p-5 font-mono text-xs text-emerald-950 bg-cream/40 overflow-x-auto max-h-[480px] overflow-y-auto leading-relaxed">
                {JSON.stringify(selectedDoc, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* ── Tab 2: _design/pantry MapReduce Views ── */}
        {activeTab === "views" && (
          <ScrollReveal variant="fadeUp">
            <div className="card p-6 space-y-4">
              <div>
                <p className="section-label">Design Document</p>
                <h3 className="font-display text-xl font-bold text-charcoal">
                  _design/pantry MapReduce Indexes
                </h3>
                <p className="font-sans text-xs text-charcoal/55 mt-0.5">
                  Defined in <code>backend/api/couchdb_service.py</code> for O(log n)
                  B-tree lookups across user pantries, categories, and scan timelines.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    name: "_view/by_user",
                    desc: "Emits all pantry_item documents keyed by user_id",
                    fn: "function(doc) {\n  if (doc.type === 'pantry_item')\n    emit(doc.user_id, null);\n}",
                  },
                  {
                    name: "_view/by_user_expiry",
                    desc: "Compound key [user_id, expiry_date] for sorted expiry alerts",
                    fn: "function(doc) {\n  if (doc.type === 'pantry_item')\n    emit([doc.user_id, doc.expiry_date], null);\n}",
                  },
                  {
                    name: "_view/by_user_category",
                    desc: "Compound key [user_id, category] for category filtering",
                    fn: "function(doc) {\n  if (doc.type === 'pantry_item')\n    emit([doc.user_id, doc.category], null);\n}",
                  },
                  {
                    name: "_view/scans_by_user",
                    desc: "Chronological scan_session history per user",
                    fn: "function(doc) {\n  if (doc.type === 'scan_session')\n    emit([doc.user_id, doc.created_at], null);\n}",
                  },
                ].map((v) => (
                  <div
                    key={v.name}
                    className="rounded-2xl p-4 bg-cream border border-sand/50 space-y-2"
                  >
                    <p className="font-mono text-xs font-bold text-forest">
                      GET /pantrypal/_design/pantry/{v.name}
                    </p>
                    <p className="font-sans text-xs text-charcoal/60">{v.desc}</p>
                    <pre className="p-3 rounded-xl bg-charcoal text-amber-200 font-mono text-xs overflow-x-auto">
                      {v.fn}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* ── Tab 3: Mango Query Runner (_find) ── */}
        {activeTab === "mango" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-5 card p-5 space-y-4">
              <div>
                <p className="section-label">POST /pantrypal/_find</p>
                <h3 className="font-display text-lg font-bold text-charcoal">
                  Mango JSON Query
                </h3>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {PRESET_QUERIES.map((q) => (
                  <button
                    key={q.label}
                    onClick={() => {
                      const str = JSON.stringify({ selector: q.selector }, null, 2);
                      setMangoInput(str);
                      setMangoResults(couchdbInspector.runMangoQuery(q.selector));
                    }}
                    className="px-2.5 py-1 rounded-xl text-xs font-sans font-semibold bg-sand/25 hover:bg-forest hover:text-white transition-colors"
                  >
                    {q.label}
                  </button>
                ))}
              </div>

              <textarea
                value={mangoInput}
                onChange={(e) => setMangoInput(e.target.value)}
                rows={7}
                className="w-full font-mono text-xs p-3.5 rounded-2xl bg-charcoal text-emerald-300 outline-none"
              />

              <button onClick={runMango} className="btn-primary w-full">
                <Play size={14} /> Run Mango Query
              </button>
            </div>

            <div className="lg:col-span-7 card overflow-hidden flex flex-col">
              <div className="px-5 py-3.5 bg-charcoal text-white flex items-center justify-between">
                <span className="font-mono text-xs font-bold">
                  Query Result ({mangoResults.length} matching docs)
                </span>
              </div>
              <pre className="p-5 font-mono text-xs text-charcoal bg-cream/40 overflow-x-auto max-h-[420px] overflow-y-auto">
                {JSON.stringify(mangoResults, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

