import React, { useEffect, useRef } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { EASE } from "@/lib/motion";

export const AnimatedNumber = ({
  value = 0,
  duration = 1.2,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
}) => {
  const reduce = useReducedMotion();
  const count = useMotionValue(reduce ? value : 0);
  const display = useTransform(count, (latest) => {
    const formatted = Number(latest).toLocaleString("en-IN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return `${prefix}${formatted}${suffix}`;
  });
  const started = useRef(false);

  useEffect(() => {
    if (reduce) {
      count.set(value);
      return;
    }
    const controls = animate(count, value, { duration, ease: EASE });
    return () => controls.stop();
  }, [count, duration, reduce, value]);

  return <motion.span className={className}>{display}</motion.span>;
};
