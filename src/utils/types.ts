export type Choice = {
  text: string
  correct?: boolean
}

export type Question = {
  id: string
  category: string
  prompt: string
  note?: string
  choices: Choice[]
}

export type QuestionBank = {
  version: number
  source?: string
  questions: Question[]
}
