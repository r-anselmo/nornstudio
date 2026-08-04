import { describe, it, expect } from 'vitest'
import { phaseReached, railFill } from './chat-rail-progress'
import type { RailPhase } from './chat-rail-progress'
import { chatPhases } from './chat-flow-script'

// The real shape: 4, 3, 1 and 4 messages across four equal rail segments.
const phases: RailPhase[] = chatPhases.map((phase) => ({
  step: phase.step,
  count: phase.messages.length,
}))

const total = phases.reduce((sum, phase) => sum + phase.count, 0)

describe('railFill', () => {
  it('is empty before anything resolves', () => {
    expect(railFill(0, phases)).toBe(0)
  })

  /**
   * The whole point of normalising per phase. `revealedCount / total` would put
   * the bar at 4/12 = 33% here, overshooting the node that sits at 25%.
   */
  it('lands exactly on a node when a phase completes', () => {
    expect(railFill(4, phases)).toBeCloseTo(0.25)
    expect(railFill(7, phases)).toBeCloseTo(0.5)
    expect(railFill(8, phases)).toBeCloseTo(0.75)
  })

  it('advances proportionally inside a phase', () => {
    // Phase 01 holds four messages, so each is a quarter of its segment.
    expect(railFill(1, phases)).toBeCloseTo(0.0625)
    expect(railFill(2, phases)).toBeCloseTo(0.125)
    // Phase 03 holds a single message: entering it fills the segment at once.
    expect(railFill(8, phases)).toBeCloseTo(0.75)
  })

  it('is full at the end and clamps past it', () => {
    expect(railFill(total, phases)).toBe(1)
    expect(railFill(total + 5, phases)).toBe(1)
  })

  it('never runs backwards', () => {
    let previous = -1
    for (let count = 0; count <= total; count += 1) {
      const fill = railFill(count, phases)
      expect(fill).toBeGreaterThanOrEqual(previous)
      previous = fill
    }
  })
})

describe('phaseReached', () => {
  it('turns on as its first message resolves, not before', () => {
    // Phases start at global message 0, 4, 7 and 8.
    expect(phaseReached(0, phases, 0)).toBe(false)
    expect(phaseReached(1, phases, 0)).toBe(true)

    expect(phaseReached(4, phases, 1)).toBe(false)
    expect(phaseReached(5, phases, 1)).toBe(true)

    expect(phaseReached(7, phases, 2)).toBe(false)
    expect(phaseReached(8, phases, 2)).toBe(true)

    expect(phaseReached(8, phases, 3)).toBe(false)
    expect(phaseReached(9, phases, 3)).toBe(true)
  })

  it('has every phase reached once the conversation ends', () => {
    for (let index = 0; index < phases.length; index += 1) {
      expect(phaseReached(total, phases, index)).toBe(true)
    }
  })
})

describe('the rail and the script agree', () => {
  /**
   * The rail is fed counts derived from chatPhases while the reveal cursor
   * counts flattened messages. If those ever drift the bar silently stops at
   * the wrong place, so pin them together.
   */
  it('covers exactly the messages the cursor walks', () => {
    expect(total).toBe(chatPhases.flatMap((phase) => phase.messages).length)
  })
})
