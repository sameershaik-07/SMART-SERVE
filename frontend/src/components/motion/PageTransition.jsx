import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { pageTransition } from "@/lib/motion";

export const PageTransition = ({ children, className, ...props }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={pageTransition}
      initial={reduce ? "animate" : "initial"}
      animate="animate"
      exit={reduce ? "animate" : "exit"}
      {...props}
    >
      {children}
    </motion.div>
  );
};
