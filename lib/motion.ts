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

/**
 * Set on `window` once the app has hydrated, telling the gate script that
 * something is alive to advance the reveals. Without the flag the gate
 * withdraws itself and the content simply stays visible.
 */
export const MOTION_HYDRATED_FLAG = '__nornHydrated'

/**
 * How long the gate waits for hydration before giving up. Long enough not to
 * race a slow bundle on a poor connection, short enough that a visitor who
 * would otherwise see nothing is not staring at a blank page.
 */
export const MOTION_GATE_TIMEOUT_MS = 8000

/**
 * Injected into `<head>` by `app/layout.tsx` and run before first paint, so the
 * hidden-initial states in globals.css apply from frame one. React state cannot
 * do this — it settles after hydration, which is after the first paint.
 *
 * The class means "reveal animations will run", so it checks the same two
 * conditions the JS guards do. A browser that cannot advance a reveal never
 * gets the class and therefore never hides anything.
 *
 * It also withdraws the class if hydration never reports in. This script runs
 * independently of the app bundle, so without that a chunk that 404s — the
 * classic stale-HTML-after-redeploy failure on static hosting — would leave the
 * CSS hiding content that nothing is left alive to reveal.
 *
 * A string built here rather than written inline in the layout: it executes
 * before any module loads and so cannot import these constants, and a literal
 * in the layout would silently drift from them. Interpolating instead keeps one
 * definition of the class, the flag and the timeout, and makes the most
 * load-bearing string on the site testable.
 */
export const motionGateScript = `if(!matchMedia("(prefers-reduced-motion: reduce)").matches&&"IntersectionObserver" in window){var d=document.documentElement;d.classList.add("${MOTION_GATE_CLASS}");setTimeout(function(){if(!window.${MOTION_HYDRATED_FLAG})d.classList.remove("${MOTION_GATE_CLASS}")},${MOTION_GATE_TIMEOUT_MS})}`

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
