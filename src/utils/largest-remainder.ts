/**
 * Distributes 100 percentage points across items so the rounded values always
 * sum to exactly 100. Uses the largest-remainder (Hamilton) method: assign
 * Math.floor to each item, then give the leftover points to the items with the
 * largest fractional parts.
 */
export function largestRemainder(
  totals: number[],
  grandTotal: number,
): number[] {
  if (grandTotal === 0 || totals.length === 0) {
    return totals.map(() => 0)
  }

  const exactPcts = totals.map((t) => (t / grandTotal) * 100)
  const floors = exactPcts.map((p) => Math.floor(p))
  const remainders = exactPcts.map((p, i) => p - floors[i]!)

  const sumFloors = floors.reduce((acc, f) => acc + f, 0)
  const toDistribute = Math.max(0, Math.round(100 - sumFloors))

  const indices = totals
    .map((_, i) => i)
    .sort((a, b) => remainders[b]! - remainders[a]!)

  const result = [...floors]
  for (let k = 0; k < toDistribute && k < indices.length; k++) {
    result[indices[k]!]!++
  }

  return result
}
