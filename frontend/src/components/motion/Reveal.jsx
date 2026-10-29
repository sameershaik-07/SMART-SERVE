import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, scaleIn, stagger, staggerFast } from "@/lib/motion";

export const Reveal = ({
  children,
  className,
  delay = 0,
  variant = fadeUp,
  once = true,
  amount = 0.2,
  as = "div",
  ...props
}) => {
  const reduce = useReducedMotion();
  const Comp = motion[as] || motion.div;

  return (
    <Comp
      className={className}
      initial={reduce ? "show" : "hidden"}
      whileInView="show"
      viewport={{ once, amount }}
      variants={variant}
      transition={{ delay }}
      {...props}
    >
      {children}
    </Comp>
  );
};

export const Stagger = ({
  children,
  className,
  fast = false,
  once = true,
  amount = 0.15,
  as = "div",
  ...props
}) => {
  const reduce = useReducedMotion();
  const Comp = motion[as] || motion.div;

  return (
    <Comp
      className={className}
      initial={reduce ? "show" : "hidden"}
      whileInView="show"
      viewport={{ once, amount }}
      variants={fast ? staggerFast : stagger}
      {...props}
    >
      {children}
    </Comp>
  );
};

export const StaggerItem = ({ children, className, variant = fadeUp, ...props }) => (
  <motion.div className={className} variants={variant} {...props}>
    {children}
  </motion.div>
);

export const ScaleIn = ({ children, className, delay = 0, ...props }) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? "show" : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={scaleIn}
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
};
