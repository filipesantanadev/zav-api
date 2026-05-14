export class GoalAlreadyCancelledError extends Error {
  constructor() {
    super('This goal has been cancelled.')
  }
}
