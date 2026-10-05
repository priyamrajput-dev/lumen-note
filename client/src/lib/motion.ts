import type { Transition, Variants } from "motion/react";

/**
 * Shared motion curve & timing tokens for Lumen Note.
 * Restrained dark-chalkboard motion: under 400ms, no bounce/spring.
 */
export const defaultEase = [0.22, 1, 0.36, 1] as const;

export const defaultTransition: Transition = {
  type: "tween",
  duration: 0.3,
  ease: defaultEase,
};

export const fastTransition: Transition = {
  type: "tween",
  duration: 0.2,
  ease: defaultEase,
};

export const slowTransition: Transition = {
  type: "tween",
  duration: 0.38,
  ease: defaultEase,
};

/**
 * Fade up: opacity 0 -> 1, y 12 -> 0.
 * Used for hero lines, section reveals, cards, and message items.
 */
export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: defaultTransition,
  },
  exit: {
    opacity: 0,
    y: 8,
    transition: fastTransition,
  },
};

/**
 * Fade in: opacity 0 -> 1.
 */
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: defaultTransition,
  },
  exit: {
    opacity: 0,
    transition: fastTransition,
  },
};

/**
 * Stagger container for lists, grids, and hero reveals (0.06s delta).
 */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

/**
 * Subtle modal / dialog entrance with controlled scale and opacity.
 */
export const dialogOverlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: fastTransition },
  exit: { opacity: 0, transition: fastTransition },
};

export const dialogContentVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: defaultTransition,
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 6,
    transition: fastTransition,
  },
};

/**
 * Popover & dropdown menu transition.
 */
export const popoverVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: -4 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: defaultTransition,
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: -4,
    transition: fastTransition,
  },
};

/**
 * Slow ambient floating loop for procedural SVG gradient blobs.
 */
export const floatingBlobAnimation = {
  y: [-6, 6, -6],
  x: [-4, 4, -4],
  transition: {
    duration: 9,
    repeat: Infinity,
    repeatType: "reverse" as const,
    ease: "easeInOut" as const,
  },
};
