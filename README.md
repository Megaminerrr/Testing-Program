# Study Quiz

A modular multiple-choice quiz app designed to run in GitHub Codespaces (browser-only). Questions are loaded from JSON so you can easily edit and replace content.

## Run in Codespaces

1. Open this repo in GitHub → green "Code" button → "Codespaces" → "Create codespace on main".
2. The dev container will start. If prompted, allow Ports access.
3. Run the app:

```bash
pnpm install
pnpm dev
```

4. Click the forwarded port (5173) to open the app.

## Edit questions

Questions live in `public/questions/questions.json`.

Schema:

```json
{
  "version": 1,
  "source": "optional string",
  "questions": [
    {
      "id": "unique-id",
      "category": "topic-tag",
      "prompt": "Question text?",
      "note": "Optional helper text",
      "choices": [
        { "text": "Option A" },
        { "text": "Option B", "correct": true }
      ]
    }
  ]
}
```

You can create multiple JSON files and switch which one is served, or keep `questions.json` as the current set. The UI lets you filter by `category`.

## Testing

```bash
pnpm test
```

## Roadmap

- Import questions from PDF/CSV
- Review mode and spaced repetition
- Timed quizzes and progress persistence
