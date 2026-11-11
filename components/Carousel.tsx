"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useT } from "@/lib/i18n";

/** A horizontal, snap-scrolling row with previous/next buttons once it overflows. */
export function Carousel({ children }: { children: ReactNode }) {
  const t = useT();
  const track = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    measure();
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure, children]);

  const step = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const overflows = !(atStart && atEnd);
  const arrow =
    "hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-panel text-ink transition hover:border-ink disabled:opacity-30 disabled:hover:border-line md:flex";

  return (
    <div className="flex w-full items-center gap-3">
      {overflows && (
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={atStart}
          aria-label={t("carousel.prev")}
          className={arrow}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M15 5l-7 7 7 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
      <div
        ref={track}
        onScroll={measure}
        className="flex min-w-0 flex-1 snap-x snap-mandatory gap-5 overflow-x-auto px-1 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>*:first-child]:ml-auto [&>*:last-child]:mr-auto"
      >
        {children}
      </div>
      {overflows && (
        <button
          type="button"
          onClick={() => step(1)}
          disabled={atEnd}
          aria-label={t("carousel.next")}
          className={arrow}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M9 5l7 7-7 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
