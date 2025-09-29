import { z } from 'zod'

export const ChoiceSchema = z.object({
  text: z.string().min(1),
  correct: z.boolean().optional()
})

export const QuestionSchema = z.object({
  id: z.string().min(1),
  category: z.string().min(1),
  prompt: z.string().min(1),
  note: z.string().optional(),
  choices: z.array(ChoiceSchema).min(2)
})

export const QuestionBankSchema = z.object({
  version: z.number().int().positive(),
  source: z.string().optional(),
  questions: z.array(QuestionSchema).min(1)
})

export type QuestionBankInput = z.input<typeof QuestionBankSchema>
