export type HorizonPoint = { x: number; y: number }

export const HORIZON_VIEW_WIDTH = 400
export const HORIZON_VIEW_HEIGHT = 150
export const HORIZON_POINT_COUNT = 5

const X_PADDING = 16
const STEP_COUNT = HORIZON_POINT_COUNT - 1 // 4 intervals across 5 points

// Start Y is linear in score between these two bounds — the 63-unit travel
// between them (42% of HORIZON_VIEW_HEIGHT) is deliberately large: it is
// what makes the start point's height actually read as tied to the score,
// rather than the two extremes looking like minor variations on the same
// chart. The 48%-of-height floor at score 100 is the fix for "a perfect
// score must not pin the line to the very top" — it leaves headroom above
// the start point for the "com a Norn" line to still show a clear rise even
// at the best score.
//
// The content a single score ever draws — from the start point up to where
// "com a Norn" peaks — is always exactly CEILING_OFFSET + NORN_EXCESS_ABOVE_
// CEILING tall, regardless of score; only its position within the canvas
// moves. Making that fixed band a *large* fraction of HORIZON_VIEW_HEIGHT
// (not just picking a tall canvas) is what keeps the chart from reading as
// mostly empty space at any single score — a wide travel range floating in
// a much taller canvas is what produced that in the first place.
const START_Y_AT_SCORE_0 = Math.round(HORIZON_VIEW_HEIGHT * 0.9) // 135
const START_Y_AT_SCORE_100 = Math.round(HORIZON_VIEW_HEIGHT * 0.48) // 72

// Fixed vertical gap from the start point to "teto de hoje" — fixed, not a
// ratio of remaining headroom, so the ceiling reads as the same size step
// above the start at every score.
const CEILING_OFFSET = Math.round(HORIZON_VIEW_HEIGHT * 0.213) // 32

// Decay rate for "Ritmo sozinho"'s approach to the ceiling. Exponential decay
// is asymptotic by construction — exp(-rate * t) is never exactly 0 for
// finite t — which is what makes "never reaches or crosses the ceiling" true
// by the shape of the curve, not by a clamp.
const ALONE_DECAY_RATE = 0.4

// How far below the ceiling the "com a Norn" line finishes (smaller y =
// higher on screen = further past the ceiling). Fixed, same reasoning as
// CEILING_OFFSET.
const NORN_EXCESS_ABOVE_CEILING = Math.round(HORIZON_VIEW_HEIGHT * 0.2) // 30

// Shape of how far "com a Norn" pulls away from "Ritmo sozinho" over time.
// Linear (not eased): the two lines still only touch at the shared start
// point (boost is 0 there), but a cubic ease-in kept them visually fused
// together until past the +6m tick and only opened a readable gap in the
// last stretch — on a compact illustrative chart that reads as "the same
// line" for most of its length, not two distinguishable paths. A linear
// boost opens a visible gap from the very next tick on, while the ceiling
// line's own exponential shape still keeps "com a Norn" reading as a curve,
// not a straight ramp.
const NORN_SEPARATION_POWER = 1

let cachedXPositions: readonly number[] | null = null

export function horizonXPositions(): readonly number[] {
  if (cachedXPositions) return cachedXPositions
  const span = HORIZON_VIEW_WIDTH - 2 * X_PADDING
  cachedXPositions = Array.from({ length: HORIZON_POINT_COUNT }, (_, i) =>
    Math.round(X_PADDING + (span / STEP_COUNT) * i)
  )
  return cachedXPositions
}

/**
 * The score maps to how far the start point has travelled via its square
 * root, not itself directly. A linear mapping moves the point only 10% of
 * the way for a score of 10 — indistinguishable from score 0 at a glance,
 * which reads as "stuck at the bottom" for anyone who didn't score exactly
 * zero. The square root is concave, so a low score already claims a large
 * share of the travel (sqrt(0.1) ≈ 32%) while still reaching the same two
 * endpoints at 0 and 100 — every nonzero score visibly lifts off the
 * baseline, and the mapping keeps narrowing what a further point is worth
 * as the score climbs, rather than every point being worth the same.
 */
export function horizonStartY(score: number): number {
  return Math.round(
    START_Y_AT_SCORE_0 -
      (START_Y_AT_SCORE_0 - START_Y_AT_SCORE_100) * Math.sqrt(score / 100)
  )
}

export function horizonCeilingY(score: number): number {
  return horizonStartY(score) - CEILING_OFFSET
}

/**
 * Monotonically non-decreasing toward the ceiling; by construction
 * (exp(-rate*t) > 0 for every finite t) this can never reach or cross
 * horizonCeilingY.
 */
export function horizonAlonePoints(score: number): HorizonPoint[] {
  const ceiling = horizonCeilingY(score)
  return horizonXPositions().map((x, i) => ({
    x,
    y: Math.round(ceiling + CEILING_OFFSET * Math.exp(-ALONE_DECAY_RATE * i)),
  }))
}

/**
 * Built as "the alone line, minus a boost that is zero at the start and only
 * grows" — NOT as an independent curve. An independent curve (e.g. its own
 * ease-in from the same start point) can cross the alone line on its way up
 * if the two curvatures disagree, which would draw "with Norn" visibly BELOW
 * "alone" for the first several months — exactly backwards. Subtracting a
 * boost that starts at 0 and never decreases guarantees
 * withNorn(i) <= alone(i) at every point, by construction, for every score.
 *
 * The boost's endpoint is chosen so the last point lands exactly
 * NORN_EXCESS_ABOVE_CEILING past the ceiling, matching horizonAlonePoints'
 * residual gap at the same point so the target is reachable in closed form.
 */
export function horizonWithNornPoints(score: number): HorizonPoint[] {
  const ceiling = horizonCeilingY(score)
  const alone = horizonAlonePoints(score)
  const residualGapAtEnd = alone[alone.length - 1].y - ceiling
  const totalBoost = residualGapAtEnd + NORN_EXCESS_ABOVE_CEILING

  return horizonXPositions().map((x, i) => {
    const boost = totalBoost * Math.pow(i / STEP_COUNT, NORN_SEPARATION_POWER)
    return { x, y: Math.round(alone[i].y - boost) }
  })
}

type BezierSegment = {
  cp1: HorizonPoint
  cp2: HorizonPoint
  end: HorizonPoint
}

/**
 * A Catmull-Rom spline through `points`, converted to cubic-bezier control
 * points per segment. Growth doesn't resolve all at once, on either line —
 * straight segments between the 5 ticks read as a sudden step at each one;
 * a spline that actually passes through the same 5 values reads as one
 * continuous ascending curve instead, which is the whole point of drawing a
 * horizon rather than a bar-per-quarter.
 *
 * No spline/smoothing library exists in this repo (same call the gauge
 * already made — hand-computed geometry over an external dependency).
 * Catmull-Rom is the standard closed-form choice: unlike an approximating
 * curve (e.g. a simplified/smoothed path), it interpolates every input
 * point exactly, so the curve still visits the real values this module
 * computed rather than a fuzzy average of them. Ends are clamped by
 * reusing the first/last point as its own neighbor, which also makes the
 * two-point case fall back to an exactly straight line (see horizonPathD's
 * test) rather than an arbitrary curve out of nowhere.
 */
function catmullRomSegments(
  points: readonly HorizonPoint[]
): BezierSegment[] {
  const segments: BezierSegment[] = []
  for (let i = 0; i < points.length - 1; i++) {
    // Segment goes from `start` to `end`; `before`/`after` are its
    // neighbors, clamped to the segment's own endpoints past the ends of
    // the array so the tangent at the first/last point doesn't reach for a
    // point that doesn't exist.
    const before = points[i - 1] ?? points[i]
    const start = points[i]
    const end = points[i + 1]
    const after = points[i + 2] ?? end

    segments.push({
      cp1: {
        x: Math.round(start.x + (end.x - before.x) / 6),
        y: Math.round(start.y + (end.y - before.y) / 6),
      },
      cp2: {
        x: Math.round(end.x - (after.x - start.x) / 6),
        y: Math.round(end.y - (after.y - start.y) / 6),
      },
      end,
    })
  }
  return segments
}

export function horizonPathD(points: readonly HorizonPoint[]): string {
  const [first, ...rest] = points
  const segments = catmullRomSegments(points)
  return (
    `M${first.x} ${first.y} ` +
    rest
      .map((_, i) => {
        const { cp1, cp2, end } = segments[i]
        return `C${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${end.x} ${end.y}`
      })
      .join(' ')
  )
}

function cubicBezierAt(
  p0: HorizonPoint,
  cp1: HorizonPoint,
  cp2: HorizonPoint,
  p3: HorizonPoint,
  t: number
): HorizonPoint {
  const mt = 1 - t
  const a = mt * mt * mt
  const b = 3 * mt * mt * t
  const c = 3 * mt * t * t
  const d = t * t * t
  return {
    x: a * p0.x + b * cp1.x + c * cp2.x + d * p3.x,
    y: a * p0.y + b * cp1.y + c * cp2.y + d * p3.y,
  }
}

const LENGTH_SAMPLES_PER_SEGMENT = 24

/**
 * A cubic bezier's arc length has no closed form, so this samples each
 * segment finely and sums the straight-line distance between samples — the
 * same "hand-compute, don't reach for the DOM" reasoning as the rest of this
 * module (this is a static export with prerendered/SSR'd HTML: there is no
 * `getTotalLength()` available the first time this needs to render). Used to
 * size the stroke-dasharray/dashoffset draw-on animation, which only needs
 * to be close enough that the line finishes fully drawn — not exact to the
 * sub-pixel.
 */
export function horizonPathLength(points: readonly HorizonPoint[]): number {
  const segments = catmullRomSegments(points)
  let length = 0
  let previous = points[0]

  for (let i = 0; i < segments.length; i++) {
    const start = i === 0 ? points[0] : segments[i - 1].end
    const { cp1, cp2, end } = segments[i]
    for (let step = 1; step <= LENGTH_SAMPLES_PER_SEGMENT; step++) {
      const sample = cubicBezierAt(
        start,
        cp1,
        cp2,
        end,
        step / LENGTH_SAMPLES_PER_SEGMENT
      )
      length += Math.hypot(sample.x - previous.x, sample.y - previous.y)
      previous = sample
    }
  }

  return Math.round(length)
}
