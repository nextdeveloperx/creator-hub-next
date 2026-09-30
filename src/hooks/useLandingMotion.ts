import { useReducedMotion } from 'framer-motion';

/**
 * The home page is a motion showcase, so its ambient animation (orb, marquees, entrances, carousel) keeps
 * playing even when the OS "reduce motion" flag is on. That flag is often set by accident, e.g. by Windows'
 * "Animation effects: off" or a battery saver, and the owner could not see any animation at all.
 *
 * Set this to true to make the home page follow the OS setting again.
 */
export const LANDING_FOLLOWS_OS_REDUCED_MOTION = false;

export function useLandingReducedMotion(): boolean {
  const os = useReducedMotion();
  return LANDING_FOLLOWS_OS_REDUCED_MOTION ? !!os : false;
}
