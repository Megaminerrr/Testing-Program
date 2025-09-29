/*
  Usage in Codespaces:
  pnpm add -D tsx pdf-parse zod
  pnpm extract:pdf path/to/source.pdf public/questions/questions.json
*/
import fs from 'node:fs'
import path from 'node:path'
import pdf from 'pdf-parse'
import { z } from 'zod'

const inputPath = process.argv[2]
const outputPath = process.argv[3] || 'public/questions/questions.json'

if (!inputPath) {
  console.error('Usage: tsx scripts/extract-from-pdf.ts <input.pdf> [output.json]')
  process.exit(1)
}

async function readPdf(filePath: string): Promise<string> {
  const data = await fs.promises.readFile(filePath)
  const result = await pdf(data)
  return result.text
}

type Choice = { text: string; correct?: boolean }
type Question = { id: string; category: string; prompt: string; note?: string; choices: Choice[] }

const QuestionBankSchema = z.object({
  version: z.literal(1),
  source: z.string().optional(),
  questions: z.array(z.object({
    id: z.string(),
    category: z.string(),
    prompt: z.string(),
    note: z.string().optional(),
    choices: z.array(z.object({ text: z.string(), correct: z.boolean().optional() })).min(2)
  })).min(1)
})

function parseQuestionsFromText(text: string): Question[] {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  const questions: Question[] = []
  let current: { prompt: string; choices: Choice[] } | null = null
  let qIndex = 1

  const questionStart = /^((Q\s*\d+)|\d+\.)\s+(.*)$/i
  const choiceLine = /^(?:[A-Da-d][\).]|\(?(?:[1-4])[\).])\s+(.*)$/
  const correctHint = /(\*|\(correct\)|\[correct\])/i
  const correctSuffix = /(\s*\*\s*)$/
  const correctAnswerLine = /^\(?(?:answer|correct answer)\s*[:=]\s*([A-Da-d1-4])\)?/i

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]
    const qMatch = line.match(questionStart)
    if (qMatch) {
      if (current && current.choices.length >= 2) {
        questions.push({ id: `q${qIndex++}` , category: 'default', prompt: current.prompt, choices: current.choices })
      }
      current = { prompt: qMatch[4] || line.replace(questionStart, '$3'), choices: [] }
      continue
    }
    if (!current) continue

    const cMatch = line.match(choiceLine)
    if (cMatch) {
      const raw = cMatch[1].trim()
      const isCorrect = correctHint.test(raw) || correctSuffix.test(raw)
      const textOnly = raw.replace(correctHint, '').replace(correctSuffix, '').trim()
      current.choices.push({ text: textOnly, correct: isCorrect || undefined })
      continue
    }

    const caMatch = line.match(correctAnswerLine)
    if (caMatch && current.choices.length >= 2) {
      const marker = caMatch[1].toUpperCase()
      let index = -1
      if (/[A-D]/.test(marker)) index = marker.charCodeAt(0) - 65
      if (/[1-4]/.test(marker)) index = Number(marker) - 1
      if (index >= 0 && index < current.choices.length) {
        current.choices = current.choices.map((c, i) => ({ ...c, correct: i === index }))
      }
      continue
    }
  }
  if (current && current.choices.length >= 2) {
    questions.push({ id: `q${qIndex++}` , category: 'default', prompt: current.prompt, choices: current.choices })
  }
  return questions
}

async function main() {
  const text = await readPdf(inputPath)
  const questions = parseQuestionsFromText(text)
  if (questions.length === 0) {
    console.error('No questions parsed. Please review the parser rules for your PDF format.')
    process.exit(2)
  }
  const bank = { version: 1 as const, source: path.basename(inputPath), questions }
  const parsed = QuestionBankSchema.parse(bank)
  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.promises.writeFile(outputPath, JSON.stringify(parsed, null, 2))
  console.log(`Wrote ${questions.length} questions to ${outputPath}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
