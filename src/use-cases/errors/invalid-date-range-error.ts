export class InvalidDateRangeError extends Error {
  constructor() {
    super('The start date cannot be later than the end date.')
  }
}
