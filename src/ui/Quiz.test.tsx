import { render, screen, fireEvent } from '@testing-library/react'
import { Quiz } from './Quiz'
import type { QuestionBank } from '../utils/types'

const qb: QuestionBank = {
  version: 1,
  questions: [
    {
      id: '1',
      category: 'test',
      prompt: '2 + 2 = ?',
      choices: [
        { text: '3' },
        { text: '4', correct: true },
        { text: '5' },
        { text: '22' }
      ]
    }
  ]
}

describe('Quiz', () => {
  it('renders and accepts an answer', async () => {
    render(<Quiz questionBank={qb} />)
    expect(screen.getByText(/2 \+ 2/)).toBeInTheDocument()
    const options = screen.getAllByRole('button', { name: /A\.|B\.|C\.|D\./ })
    fireEvent.click(options[1])
    expect(screen.getByText(/Score:/)).toBeInTheDocument()
  })
})
