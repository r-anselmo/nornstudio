import { describe, it, expect } from 'vitest'
import {
  HORIZON_POINT_COUNT,
  HORIZON_VIEW_HEIGHT,
  HORIZON_VIEW_WIDTH,
  horizonAlonePoints,
  horizonCeilingY,
  horizonPathD,
  horizonPathLength,
  horizonStartY,
  horizonWithNornPoints,
  horizonXPositions,
} from './quiz-horizon'

describe('horizonXPositions', () => {
  it('returns one x per chart point, evenly spaced', () => {
    const positions = horizonXPositions()

    expect(positions).toHaveLength(HORIZON_POINT_COUNT)
    const step = positions[1] - positions[0]
    for (let i = 1; i < positions.length; i++) {
      expect(positions[i] - positions[i - 1]).toBe(step)
    }
  })

  it('stays within the chart viewBox', () => {
    const positions = horizonXPositions()

    expect(positions[0]).toBeGreaterThanOrEqual(0)
    expect(positions[positions.length - 1]).toBeLessThanOrEqual(
      HORIZON_VIEW_WIDTH
    )
  })
})

describe('horizonStartY', () => {
  it('is strictly lower on the chart for a lower score', () => {
    expect(horizonStartY(0)).toBeGreaterThan(horizonStartY(50))
    expect(horizonStartY(50)).toBeGreaterThan(horizonStartY(100))
  })

  it('leaves visible headroom above the start point even at a perfect score', () => {
    expect(horizonStartY(100)).toBeGreaterThan(HORIZON_VIEW_HEIGHT * 0.2)
  })

  it('lifts even a low nonzero score clearly off the score-0 baseline', () => {
    // A linear score-to-height mapping only moves the point 10% of the way
    // for a score of 10 — visually indistinguishable from score 0, which
    // reads as "stuck at the bottom" for anyone who didn't score exactly
    // zero. The mapping is biased so a modest score still lifts the point
    // by a clearly visible amount (more than 10% of the chart height).
    const zero = horizonStartY(0)
    const low = horizonStartY(10)
    expect(zero - low).toBeGreaterThan(HORIZON_VIEW_HEIGHT * 0.1)
  })
})

describe('horizonCeilingY', () => {
  it('sits above the start point at every score', () => {
    for (const score of [0, 25, 50, 75, 100]) {
      expect(horizonCeilingY(score)).toBeLessThan(horizonStartY(score))
    }
  })
})

describe('horizonAlonePoints', () => {
  it('starts at the shared start point', () => {
    for (const score of [0, 25, 50, 75, 100]) {
      expect(horizonAlonePoints(score)[0].y).toBe(horizonStartY(score))
    }
  })

  it('never reaches or crosses the ceiling, at any point, at any score', () => {
    for (const score of [0, 25, 50, 75, 100]) {
      const ceiling = horizonCeilingY(score)
      for (const point of horizonAlonePoints(score)) {
        expect(point.y).toBeGreaterThan(ceiling)
      }
    }
  })

  it('rises toward the ceiling without ever dipping back down', () => {
    for (const score of [0, 50, 100]) {
      const points = horizonAlonePoints(score)
      for (let i = 1; i < points.length; i++) {
        expect(points[i].y).toBeLessThanOrEqual(points[i - 1].y)
      }
    }
  })
})

describe('horizonWithNornPoints', () => {
  it('shares the same start point as the alone line', () => {
    for (const score of [0, 25, 50, 75, 100]) {
      expect(horizonWithNornPoints(score)[0].y).toBe(horizonStartY(score))
    }
  })

  it('rises without ever dipping back down', () => {
    for (const score of [0, 50, 100]) {
      const points = horizonWithNornPoints(score)
      for (let i = 1; i < points.length; i++) {
        expect(points[i].y).toBeLessThanOrEqual(points[i - 1].y)
      }
    }
  })

  it('never draws below (never has a higher y than) the alone line, at any point, at any score', () => {
    // This is the property that catches a line that starts together with the
    // alone line but dips beneath it before overtaking — which would draw
    // "with Norn" as worse than "alone" for part of the horizon.
    for (const score of [0, 25, 50, 75, 100]) {
      const alone = horizonAlonePoints(score)
      const withNorn = horizonWithNornPoints(score)
      for (let i = 0; i < alone.length; i++) {
        expect(withNorn[i].y).toBeLessThanOrEqual(alone[i].y)
      }
    }
  })

  it('exceeds the ceiling by the last point, at every score', () => {
    for (const score of [0, 25, 50, 75, 100]) {
      const points = horizonWithNornPoints(score)
      expect(points[points.length - 1].y).toBeLessThan(horizonCeilingY(score))
    }
  })
})

describe('horizonPathD', () => {
  it('moves to the first point, then curves through each of the rest', () => {
    const points = horizonWithNornPoints(50)

    const d = horizonPathD(points)

    expect(d.startsWith(`M${points[0].x} ${points[0].y}`)).toBe(true)
    expect(d.match(/C/g)).toHaveLength(points.length - 1)
  })

  it('actually passes through every one of the original points, not just near them', () => {
    // A Catmull-Rom spline interpolates its control points exactly (unlike an
    // approximating curve, e.g. a smoothed/simplified path) — the data itself
    // is illustrative, but the drawn curve must still visit the real values
    // this module computed, not some approximation of them.
    const points = horizonWithNornPoints(50)

    const d = horizonPathD(points)

    for (const point of points) {
      expect(d).toContain(`${point.x} ${point.y}`)
    }
  })

  it('draws a straight line between exactly two points', () => {
    // Degenerate case: Catmull-Rom's clamped end tangents make every control
    // point fall on the line between the two points, so the "curve" is
    // still geometrically straight when there's nothing to curve around.
    const d = horizonPathD([
      { x: 0, y: 10 },
      { x: 10, y: 0 },
    ])

    expect(d).toBe('M0 10 C2 8 8 2 10 0')
  })
})

describe('horizonPathLength', () => {
  it('is a positive whole number for a real set of points', () => {
    const length = horizonPathLength(horizonWithNornPoints(50))

    expect(Number.isInteger(length)).toBe(true)
    expect(length).toBeGreaterThan(0)
  })

  it('is the straight-line distance for a simple two-point path', () => {
    expect(horizonPathLength([{ x: 0, y: 0 }, { x: 3, y: 4 }])).toBe(5)
  })

  it('is longer than the straight-line total for a genuinely bent path', () => {
    // A curve bowing through an off-line midpoint has to cover more ground
    // than the two straight chords connecting the same three points.
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { x: 20, y: 0 },
    ]
    const straightTotal =
      Math.hypot(10, 10) + Math.hypot(10, -10) // 28.28...

    expect(horizonPathLength(points)).toBeGreaterThan(Math.round(straightTotal))
  })
})
