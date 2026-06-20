export class CategoryHasActiveGoalsError extends Error {
  constructor() {
    super('Cannot delete a category that has active goals linked to it.')
    this.name = 'CategoryHasActiveGoalsError'
  }
}
