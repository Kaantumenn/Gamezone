"use client";

import { useEffect, useState } from "react";

export function ClockWidget() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const time = now.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const date = now.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  });

  return (
    <div className="rounded-xl border border-white/5 bg-[#0d0d18] px-4 py-3">
      <p className="text-2xl font-semibold tracking-wide text-white">{time}</p>
      <p className="mt-0.5 text-xs text-white/40">{date}</p>
    </div>
  );
}
