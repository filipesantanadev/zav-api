export class GoalAlreadyAchievedError extends Error {
  constructor() {
    super('This goal has already been achieved.')
  }
}
