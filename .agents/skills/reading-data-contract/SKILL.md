---
name: reading-data-contract
description: Change IELTS Reading persistence, REST APIs, publish validation, access control, answer exposure, or server-side grading in this project.
---

# Reading data contract

Apply this skill for backend, database, schema, or scoring work. Inspect current code before choosing a library or datastore: this project uses React/TypeScript/Vite, Express, Node 24 SQLite, and a local admin token. Avoid parallel auth or database systems.

- `docs/reading-ui/reading.schema.json` is the publish shape contract. `shared/validate.ts` adds business checks; drafts may be partial. Keep schema and business validation on the server before publish, including single exercises and full tests.
- SQLite migrations live in `server/migrations/`; `server/db.ts` uses `READING_DB` or `data/reading.sqlite`. Preserve published `PassageVersion` immutability. Single exercises and full tests are separate persisted entities; a published test fixes three passage version IDs.
- `/api/admin` requires `x-admin-token`; the local server binds `127.0.0.1`. The default token is for local development, not a deployment auth design. Public reads expose published content without `AnswerKey`, explanation, or evidence until submission enters review.
- `shared/grading.ts` grades on the server. TF/NG and Y/N/NG accept legacy `NOTGIVEN` as `NOT GIVEN`; text answers normalize case and whitespace. Multiple-choice multiple defaults to unordered per-slot credit, with duplicate selections counted once. Current submissions return grades and review keys but do not persist student attempts.
- Current API/UI test scripts call the running server and create records in its SQLite file. Before testing against a user's database, use an isolated `READING_DB` or clearly account for generated records; never delete existing data merely to clean test output.
- Consult `server/index.ts`, `shared/grading.ts`, `shared/validate.ts`, and the schema for exact contracts. Verify backend changes with targeted tests (`npm run test:grading`, `npm run test:validation`, `npm test`) and `npm run build` as applicable.
