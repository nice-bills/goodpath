export const EASE_OUT = [0.32, 0.72, 0, 1] as const;

export const springSnappy = { type: "spring" as const, stiffness: 380, damping: 32 };

export const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: EASE_OUT },
};

export const stagger = (i: number) => ({
  transition: { delay: i * 0.07, duration: 0.5, ease: EASE_OUT },
});
