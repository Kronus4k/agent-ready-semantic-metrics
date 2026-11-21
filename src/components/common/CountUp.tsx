import { animate, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import type { MetricFormat } from "@/data/metrics";
import { formatValue } from "@/lib/semantic";

/** Animates from the previous value to the new one. Final frame is the exact value. */
export function CountUp({ value, format, className }: { value: number; format: MetricFormat; className?: string }) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);
  const from = useRef(reduce ? value : 0);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      from.current = value;
      return;
    }
    const controls = animate(from.current, value, {
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
