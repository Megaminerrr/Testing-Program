import { useMemo, useState } from 'react'
import { Quiz } from '../ui/Quiz'
import { useQuestionBank } from '../utils/useQuestionBank'

export function App() {
  const { questionBank, error } = useQuestionBank()
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const categories = useMemo(() => {
    const set = new Set<string>(['all'])
    for (const q of questionBank.questions) set.add(q.category)
    return Array.from(set)
  }, [questionBank])

  if (error) {
    return <div className="container"><h1>Study Quiz</h1><p className="error">{error}</p></div>
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Study Quiz</h1>
        <div className="toolbar">
          <label>
            Category:
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>
      </header>
      <Quiz questionBank={questionBank} category={categoryFilter === 'all' ? undefined : categoryFilter} />
    </div>
  )
}
