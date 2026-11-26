import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger.js';

gsap.registerPlugin(ScrollTrigger);

// Al terminar, CSS vuelve a controlar el posicionamiento y los estados hover.
export const entrance = {
  duration: 0.6,
  ease: 'power3.out',
  clearProps: 'transform,opacity,visibility',
};

export const motionQuery = '(prefers-reduced-motion: no-preference)';
export { gsap };
