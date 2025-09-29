import { useEffect, useMemo, useState } from 'react'
import type { QuestionBank, Question } from '../utils/types'
import { shuffleArray } from '../utils/shuffle'

type Props = {
  questionBank: QuestionBank
  category?: string
}

type AnswerState = 'unanswered' | 'correct' | 'incorrect'

export function Quiz({ questionBank, category }: Props) {
  const filtered = useMemo(() => {
    const candidates = category
      ? questionBank.questions.filter(q => q.category === category)
      : questionBank.questions
    const withShuffledChoices = candidates.map(q => ({
      ...q,
      choices: shuffleArray([...q.choices])
    }))
    return shuffleArray(withShuffledChoices)
  }, [questionBank, category])

  const [index, setIndex] = useState<number>(0)
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered')
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null)
  const [score, setScore] = useState<number>(0)

  useEffect(() => {
    setIndex(0)
    setAnswerState('unanswered')
    setSelectedChoice(null)
    setScore(0)
  }, [category])

  if (filtered.length === 0) {
    return <p>No questions available.</p>
  }

  const current: Question = filtered[index]

  function submit(choiceIndex: number) {
    if (answerState !== 'unanswered') return
    setSelectedChoice(choiceIndex)
    const isCorrect = current.choices[choiceIndex].correct === true
    setAnswerState(isCorrect ? 'correct' : 'incorrect')
    if (isCorrect) setScore(s => s + 1)
  }

  function next() {
    if (index + 1 < filtered.length) {
      setIndex(i => i + 1)
      setAnswerState('unanswered')
      setSelectedChoice(null)
    }
  }

  function restart() {
    setIndex(0)
    setAnswerState('unanswered')
    setSelectedChoice(null)
    setScore(0)
  }

  const progress = `${index + 1} / ${filtered.length}`

  return (
    <div className="quiz">
      <div className="progress">
        <span>Question {progress}</span>
        <span>Score: {score}</span>
      </div>

      <div className="card">
        <h2 className="prompt">{current.prompt}</h2>
        {current.note && <p className="note">{current.note}</p>}
        <ul className="choices">
          {current.choices.map((c, i) => {
            const chosen = selectedChoice === i
            const isCorrect = c.correct === true
            const showCorrectness = answerState !== 'unanswered'
            const className = [
              'choice',
              chosen ? 'selected' : '',
              showCorrectness && chosen && isCorrect ? 'correct' : '',
              showCorrectness && chosen && !isCorrect ? 'incorrect' : '',
              showCorrectness && !chosen && isCorrect ? 'reveal-correct' : ''
            ].filter(Boolean).join(' ')
            return (
              <li key={i}>
                <button className={className} onClick={() => submit(i)} disabled={answerState !== 'unanswered'}>
                  <span className="letter">{String.fromCharCode(65 + i)}.</span> {c.text}
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="actions">
        {answerState !== 'unanswered' ? (
          <button onClick={next} disabled={index + 1 >= filtered.length}>Next</button>
        ) : (
          <button onClick={() => submit(-1)} disabled>Submit</button>
        )}
        <button onClick={restart}>Restart</button>
      </div>
    </div>
  )
}
