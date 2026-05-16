export class GoalTargetAmountBelowCurrentError extends Error {
  constructor() {
    super('The target value cannot be lower than the current target value.')
  }
}
