import type { Goal } from '@/repositories/goals-repository'
import dayjs from 'dayjs'

export function goalPresenter(goal: Goal) {
  return {
    ...goal,
    deadline: dayjs(goal.deadline).format('YYYY-MM-DD'),
  }
}
