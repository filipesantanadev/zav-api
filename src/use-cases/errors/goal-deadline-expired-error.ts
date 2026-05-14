export class GoalDeadlineExpiredError extends Error {
  constructor() {
    super('The deadline for this goal has already passed.')
  }
}
