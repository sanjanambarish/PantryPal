import React from "react";
const CFG = {
  fresh:         { dot:"●", label:"Fresh",         cls:"badge-fresh"    },
  expiring_soon: { dot:"●", label:"Expiring Soon", cls:"badge-expiring" },
  expired:       { dot:"●", label:"Expired",       cls:"badge-expired"  },
};
export default function StatusBadge({ status }) {
  const c = CFG[status] || CFG.fresh;
  return <span className={c.cls}>{c.dot} {c.label}</span>;
}
