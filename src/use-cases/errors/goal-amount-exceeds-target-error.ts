export class GoalAmountExceedsTargetError extends Error {
  constructor() {
    super('The provided amount exceeds the goal target amount.')
  }
}
