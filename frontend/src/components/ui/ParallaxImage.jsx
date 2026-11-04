import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Image with a parallax scroll effect.
 * The image moves at a different speed than the page scroll,
 * creating a depth illusion.
 */
export default function ParallaxImage({
  src,
  alt = "",
  className = "",
  speed = 0.15,          // 0 = no parallax, 0.3 = strong
  height = "h-64",
  overlay = true,
  overlayStyle = {},
  children,
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Map scroll progress to a y translation
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${height} ${className}`}>
      <motion.div
        style={{ y, height: "130%", width: "100%", position: "absolute", top: "-15%" }}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </motion.div>

      {/* Gradient overlay */}
      {overlay && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)",
            ...overlayStyle,
          }}
        />
      )}

      {/* Content on top */}
      {children && (
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          {children}
        </div>
      )}
    </div>
  );
}
