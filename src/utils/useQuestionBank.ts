import { useEffect, useState } from 'react'
import type { QuestionBank } from './types'
import { QuestionBankSchema, type QuestionBankInput } from './schema'

const defaultBank: QuestionBank = {
  version: 1,
  source: 'sample',
  questions: [
    {
      id: 'sample-1',
      category: 'general',
      prompt: 'Sample question: What is 2 + 2?',
      choices: [
        { text: '3' },
        { text: '4', correct: true },
        { text: '5' },
        { text: '22' }
      ]
    }
  ]
}

export function useQuestionBank() {
  const [questionBank, setQuestionBank] = useState<QuestionBank>(defaultBank)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/questions/questions.json', { cache: 'no-cache' })
      .then(async res => {
        if (!res.ok) throw new Error(`Failed to load questions.json (${res.status})`)
        return res.json()
      })
      .then((data: QuestionBankInput) => {
        if (cancelled) return
        const parsed = QuestionBankSchema.parse(data)
        setQuestionBank(parsed)
      })
      .catch(err => {
        if (cancelled) return
        setError(`Using built-in sample questions. ${String(err.message || err)}`)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { questionBank, error }
}
