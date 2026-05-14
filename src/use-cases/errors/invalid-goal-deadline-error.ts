export class InvalidGoalDeadlineError extends Error {
  constructor() {
    super('The deadline must be a future date.')
  }
}
