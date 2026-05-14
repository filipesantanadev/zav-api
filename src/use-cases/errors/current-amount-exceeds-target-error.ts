export class CurrentAmountExceedsTargetError extends Error {
  constructor() {
    super('The current amount cannot be greater than the target amount.')
  }
}
