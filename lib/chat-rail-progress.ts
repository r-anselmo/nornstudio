export type RailPhase = {
  step: string
  count: number
}

/**
 * How far down the rail the bar should sit, 0 to 1.
 *
 * Deliberately **not** `revealedCount / total`. The phases hold 4, 3, 1 and 4
 * messages but the rail draws four equal segments, so a raw message ratio would
 * cross the nodes at the wrong moment — 4 of 12 messages is 33% of the thread
 * but the second node sits at 25%. Normalising per phase keeps the bar and the
 * nodes in step.
 */
export function railFill(revealedCount: number, phases: RailPhase[]): number {
  if (phases.length === 0) return 0

  let seen = 0
  for (let index = 0; index < phases.length; index += 1) {
    const { count } = phases[index]
    if (revealedCount < seen + count) {
      const within = count === 0 ? 0 : (revealedCount - seen) / count
      return (index + within) / phases.length
    }
    seen += count
  }

  return 1
}

/** A phase counts as reached once its first message has resolved. */
export function phaseReached(
  revealedCount: number,
  phases: RailPhase[],
  index: number
): boolean {
  let offset = 0
  for (let i = 0; i < index; i += 1) {
    offset += phases[i].count
  }
  return revealedCount > offset
}
