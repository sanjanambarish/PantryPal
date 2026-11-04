import React, { useEffect } from "react";
import { X } from "lucide-react";
import clsx from "clsx";

export default function Modal({ open, onClose, title, children, size="md" }) {
  useEffect(() => {
    const h = (e) => { if (e.key==="Escape") onClose(); };
    if (open) document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;
  const sizes = { sm:"max-w-sm", md:"max-w-lg", lg:"max-w-2xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-charcoal/30 backdrop-blur-sm" onClick={onClose} />
      <div className={clsx("relative w-full animate-scale-in rounded-t-4xl sm:rounded-4xl safe-bottom", sizes[size])}
        style={{ background:"#FEFCF8", boxShadow:"0 40px 80px rgba(0,0,0,0.18)" }}>
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-sand" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-4 pb-4 border-b border-sand/50">
          <h2 className="font-display text-lg font-bold text-charcoal">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-sand/40 text-charcoal/40 hover:text-charcoal transition-colors">
            <X size={16} />
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-5 max-h-[80dvh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
