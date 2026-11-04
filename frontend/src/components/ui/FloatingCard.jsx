import React from "react";
import { motion } from "framer-motion";

/**
 * Card with a smooth hover 3D tilt + lift effect.
 */
export default function FloatingCard({ children, className = "", intensity = 8 }) {
  const handleMouse = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -intensity;
    const rotateY = ((x - centerX) / centerX) * intensity;
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    card.style.boxShadow = `${-rotateY * 1.5}px ${rotateX * 1.5}px 40px rgba(0,0,0,0.15)`;
  };

  const handleLeave = (e) => {
    e.currentTarget.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)";
    e.currentTarget.style.boxShadow = "";
  };

  return (
    <motion.div
      className={className}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ transition: "transform 0.15s ease, box-shadow 0.15s ease", willChange: "transform" }}
    >
      {children}
    </motion.div>
  );
}
