import React from "react";
import clsx from "clsx";
export default function Spinner({ size="md", className="" }) {
  const s = { sm:"w-4 h-4 border", md:"w-6 h-6 border-2", lg:"w-10 h-10 border-2" };
  return <div className={clsx(s[size],"border-forest border-t-transparent rounded-full animate-spin",className)} />;
}
