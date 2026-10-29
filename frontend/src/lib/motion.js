export const EASE = [0.22, 1, 0.36, 1];
export const EASE_SOFT = [0.16, 1, 0.3, 1];

export const duration = {
  fast: 0.18,
  base: 0.32,
  slow: 0.55,
  hero: 0.75,
};

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.slow, ease: EASE },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: duration.slow, ease: EASE } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.97, y: 12 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: duration.base, ease: EASE },
  },
};

export const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.075, delayChildren: 0.08 },
  },
};

export const staggerFast = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.045, delayChildren: 0.04 },
  },
};

export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.base, ease: EASE },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: duration.fast, ease: "easeIn" },
  },
};

export const modalSpring = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};
