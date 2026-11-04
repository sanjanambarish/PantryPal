import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { analytics as analyticsApi } from "../api/client";
import Spinner from "../components/ui/Spinner";
import toast from "react-hot-toast";
import ScrollReveal, { StaggerList } from "../components/ui/ScrollReveal";
import ParallaxImage from "../components/ui/ParallaxImage";
import AnimatedCounter from "../components/ui/AnimatedCounter";
import FloatingCard from "../components/ui/FloatingCard";
import {
  TrendingUp, Bell, Package, CheckCircle, AlertTriangle, XCircle, Sparkles
} from "lucide-react";
import {
  Chart as ChartJS, ArcElement, CategoryScale,
  LinearScale, BarElement, Tooltip, Legend
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { PAGE_HEROES, FOOD_IMAGES } from "../assets/images";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

const PALETTE = [
  "#2D4A2D", "#C17B4A", "#6B7C3A", "#5C3D2E", "#8A9E4A",
  "#A0756A", "#3A6B3A", "#7A5244", "#D4C5A9", "#B8A88A",
];

const tooltipStyle = {
  backgroundColor: "#fff",
  borderColor: "rgba(212,197,169,0.6)",
  borderWidth: 1,
  titleColor: "#1C1C1C",
  bodyColor: "#7A7060",
  padding: 10,
  cornerRadius: 12,
};

const barOpts = {
  responsive: true,
  plugins: { legend: { display: false }, tooltip: tooltipStyle },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { color: "#7A7060", stepSize: 1, font: { size: 11, family: "DM Sans" } },
      grid: { color: "rgba(212,197,169,0.25)" },
      border: { color: "transparent" },
    },
    x: {
      ticks: { color: "#7A7060", font: { size: 11, family: "DM Sans" } },
      grid: { display: false },
      border: { color: "transparent" },
    },
  },
};

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi
      .get()
      .then((r) => setData(r.data))
      .catch(() => toast.error("Could not load."))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  if (!data) return null;

  const catLabels = Object.keys(data.category_distribution);
  const catValues = Object.values(data.category_distribution);

  const doughnutData = {
    labels: catLabels,
    datasets: [
      {
        data: catValues,
        backgroundColor: PALETTE.slice(0, catLabels.length),
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };
  const statusData = {
    labels: ["Fresh", "Expiring Soon", "Expired"],
    datasets: [
      {
        data: [data.fresh, data.expiring_soon, data.expired],
        backgroundColor: ["#2D4A2D", "#C17B4A", "#9B3B30"],
        borderRadius: 12,
        borderSkipped: false,
      },
    ],
  };
  const topData = {
    labels: data.top_items.map((i) => i.name),
    datasets: [
      {
        data: data.top_items.map((i) => i.count),
        backgroundColor: "#2D4A2D",
        borderRadius: 12,
        borderSkipped: false,
      },
    ],
  };

  return (
    <div className="-mx-4 md:-mx-8 -mt-6 md:-mt-8 space-y-0">
      {/* ── Parallax Hero with Wooden Scoops & Spices on Dark Slate ── */}
      <ParallaxImage
        src={PAGE_HEROES.analytics}
        alt="Spices in wooden scoops on dark slate"
        height="h-60 sm:h-72"
        overlayStyle={{
          background:
            "linear-gradient(90deg, rgba(14,14,12,0.88) 0%, rgba(20,16,12,0.65) 55%, rgba(20,16,12,0.3) 100%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-2 max-w-lg"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-dark text-amber-300 text-xs font-sans font-bold uppercase tracking-widest">
            <Sparkles size={11} /> Kitchen Intelligence
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">
            Pantry Analytics & Telemetry
          </h1>
          <p className="font-sans text-sm text-white/80">
            Track freshness velocity, category balance, and zero-waste kitchen
            benchmarks.
          </p>
        </motion.div>
      </ParallaxImage>

      <div className="px-4 md:px-8 pt-7 space-y-6">
        {/* Stat cards */}
        <StaggerList className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Items",
              value: data.total,
              icon: Package,
              color: "#2D4A2D",
              bg: "#EFF6F0",
              img: FOOD_IMAGES.harvest,
            },
            {
              label: "Fresh",
              value: data.fresh,
              icon: CheckCircle,
              color: "#3A6B3A",
              bg: "#E5F4E5",
              img: FOOD_IMAGES.veggies,
            },
            {
              label: "Expiring Soon",
              value: data.expiring_soon,
              icon: AlertTriangle,
              color: "#8B5A2B",
              bg: "#FEF3E8",
              img: FOOD_IMAGES.citrusspice,
            },
            {
              label: "Expired",
              value: data.expired,
              icon: XCircle,
              color: "#9B3B30",
              bg: "#FEF0EE",
              img: FOOD_IMAGES.spices,
            },
          ].map(({ label, value, icon: Icon, color, bg, img }) => (
            <FloatingCard
              key={label}
              className="card p-5 text-center relative overflow-hidden group"
            >
              <img
                src={img}
                alt={label}
                className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full object-cover opacity-15 group-hover:opacity-30 transition-opacity pointer-events-none"
              />
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-3 relative z-10"
                style={{ background: bg }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <p
                className="font-display text-3xl font-black relative z-10"
                style={{ color }}
              >
                <AnimatedCounter value={value} />
              </p>
              <p className="font-sans text-xs text-charcoal/50 font-semibold mt-1 relative z-10">
                {label}
              </p>
            </FloatingCard>
          ))}
        </StaggerList>

        {/* Waste bar */}
        <ScrollReveal variant="fadeUp">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-forest" />
                <p className="font-display font-bold text-base text-charcoal">
                  Food Waste Efficiency
                </p>
              </div>
              <span
                className="font-display font-black text-3xl"
                style={{
                  color:
                    data.waste_percentage > 30
                      ? "#9B3B30"
                      : data.waste_percentage > 10
                      ? "#C17B4A"
                      : "#2D4A2D",
                }}
              >
                <AnimatedCounter value={data.waste_percentage} />%
              </span>
            </div>
            <div className="h-3 rounded-full overflow-hidden bg-sand/30">
              <motion.div
                className="h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(data.waste_percentage, 100)}%`,
                }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                style={{
                  background:
                    data.waste_percentage > 30
                      ? "linear-gradient(90deg,#C17B4A,#9B3B30)"
                      : "linear-gradient(90deg,#3A6B3A,#2D4A2D)",
                }}
              />
            </div>
            <p className="font-sans text-xs text-charcoal/50 mt-2.5">
              Optimal benchmark is below 10%. Currently {data.expired} of{" "}
              {data.total} items have expired.
            </p>
          </div>
        </ScrollReveal>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {catLabels.length > 0 && (
            <ScrollReveal variant="fadeLeft">
              <div className="card p-6 h-full">
                <p className="font-display font-bold text-base text-charcoal mb-4">
                  Category Distribution
                </p>
                <div className="max-w-[220px] mx-auto">
                  <Doughnut
                    data={doughnutData}
                    options={{
                      responsive: true,
                      cutout: "65%",
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: {
                            color: "#7A7060",
                            boxWidth: 10,
                            padding: 12,
                            font: { size: 11, family: "DM Sans" },
                          },
                        },
                        tooltip: tooltipStyle,
                      },
                    }}
                  />
                </div>
              </div>
            </ScrollReveal>
          )}
          <ScrollReveal variant="fadeRight">
            <div className="card p-6 h-full">
              <p className="font-display font-bold text-base text-charcoal mb-4">
                Freshness Breakdown
              </p>
              <Bar data={statusData} options={barOpts} />
            </div>
          </ScrollReveal>
        </div>

        {data.top_items.length > 0 && (
          <ScrollReveal variant="scaleUp">
            <div className="card p-6">
              <p className="font-display font-bold text-base text-charcoal mb-4">
                Most Frequently Stocked Staples
              </p>
              <Bar data={topData} options={barOpts} />
            </div>
          </ScrollReveal>
        )}

        {data.alerts.length > 0 && (
          <ScrollReveal variant="fadeUp">
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Bell size={16} style={{ color: "#C17B4A" }} />
                <p className="font-display font-bold text-base text-charcoal">
                  Active Expiry Alerts
                </p>
              </div>
              <StaggerList className="space-y-2.5">
                {data.alerts.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl font-sans text-sm"
                    style={{
                      background: "#FEF9F0",
                      border: "1px solid rgba(193,123,74,0.25)",
                      color: "#8B5A2B",
                    }}
                  >
                    ⚠️ {a}
                  </div>
                ))}
              </StaggerList>
            </div>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}
