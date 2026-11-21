import { animate, useReducedMotion } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import type { MetricFormat } from "@/data/metrics";
import { formatValue } from "@/lib/semantic";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Renders the exact value on the server and in the first render, so the HTML never shows a
 * placeholder. In the browser it then counts up from zero once, and from the previous value
 * on every change after that. Final frame is always the exact value.
 */
export function CountUp({
  value,
  format,
  className,
}: {
  value: number;
  format: MetricFormat;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const from = useRef<number | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (reduce) {
      setDisplay(value);
      from.current = value;
      return;
    }
    const start = from.current ?? 0;
    const controls = animate(start, value, {
      duration: 1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: setDisplay,
      onComplete: () => setDisplay(value),
    });
    from.current = value;
    return () => controls.stop();
  }, [value, reduce]);

  return <span className={className}>{formatValue(display, format)}</span>;
}
