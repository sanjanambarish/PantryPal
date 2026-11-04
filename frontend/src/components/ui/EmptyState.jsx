import React from "react";
export default function EmptyState({ icon:Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-5 bg-sand/30">
          <Icon className="w-7 h-7 text-charcoal/25" />
        </div>
      )}
      <h3 className="font-display text-lg font-bold text-charcoal/70 mb-1.5">{title}</h3>
      {description && <p className="font-sans text-sm text-charcoal/40 max-w-xs mb-6">{description}</p>}
      {action}
    </div>
  );
}
