/**
 * Set on `<html>` by the inline script in `app/layout.tsx`, before first paint,
 * when reveal animations may run.
 *
 * The class is the single source of truth shared by the CSS hidden-initial
 * states and the JS that advances them, so the two can never disagree and
 * leave an element permanently invisible. The conditions live in that script
 * rather than here because it has to be self-contained — it runs before any
 * module loads.
 */
export const MOTION_GATE_CLASS = 'js-motion'

export function isMotionEnabled(): boolean {
  if (typeof document === 'undefined') return false
  return document.documentElement.classList.contains(MOTION_GATE_CLASS)
}

/** Beat between staggered siblings entering. */
export const STAGGER_MS = 90

/**
 * Where an element counts as having arrived. Trimming the bottom of the root
 * box anchors the trigger just inside the lower edge, so content reveals as it
 * rises into view rather than while it is still off-screen.
 */
export const REVEAL_ROOT_MARGIN = '0px 0px -12% 0px'
