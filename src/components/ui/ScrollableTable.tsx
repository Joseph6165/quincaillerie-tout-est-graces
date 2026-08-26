"use client";

import { useRef, useState, useEffect } from "react";

export default function ScrollableTable({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [showRightFade, setShowRightFade] = useState(false);

  function checkScroll() {
    const el = ref.current;
    if (!el) return;
    setShowRightFade(el.scrollWidth - el.scrollLeft - el.clientWidth > 4);
  }

  useEffect(() => {
    checkScroll();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [children]);

  return (
    <div className="relative">
      <div ref={ref} className="overflow-x-auto -webkit-overflow-scrolling-touch">
        {children}
      </div>
      {showRightFade && (
        <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent sm:hidden" />
      )}
    </div>
  );
}