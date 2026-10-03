---
name: reading-authoring
description: Extend or fix manual IELTS Reading authoring in this project, including passage fields, question group editors, answer and evidence entry, and single/full-test workflows.
---

# Reading authoring

Apply this skill when changing the admin form or a question type. Find the project root by `package.json` and `docs/reading-ui/reading.schema.json`.

- Keep `SinglePassageExercise` and `FullReadingTest` as separate objects. They share `PassageVersion`, group editors, validators, and preview; never introduce a data `mode` field to classify them.
- The required 19 types are in `shared/reading.ts` and `src/registry.tsx`. A type change is complete only when its manual editor, renderer, validation, answer shape, preview, and meaningful tests agree. Questions and gaps are dynamic; do not assume five questions.
- Preserve the distinction between passage `title`/`description`, group `instruction`/`answer_format`/`note`, and each question's answer, explanation, and evidence. Evidence quotes must match a current passage block; NOT GIVEN can have no direct quote. Optional instructions should not render a literal `NONE`; when clearing one, remove its empty block so publish remains valid.
- Long text fields use the lightweight formatting markers `**bold**`, `*italic*`, and `^^larger^^` through `src/RichText.tsx`. Render them without exposing markers, preserve line breaks in group instructions/NB, and compare evidence quotes against the displayed text via `shared/richText.ts`.
- Drafts can be incomplete and save/reload. Published passage versions are immutable: preview them directly; create a new draft version and exercise when editing. A single passage becomes public only after its exercise is published. A full test needs exactly three distinct passage versions and continuous numbering across them.
- For the form contract and worked examples, read `docs/reading-ui/reading_manual_admin_spec.md` §16 and `docs/reading-ui/HUONG_DAN_NHAP_DE_READING.md` §8. Treat those as product input; verify actual behavior in `src/Admin.tsx`, `src/typeEditors.tsx`, and `shared/validate.ts` before changing code.
- Verify a relevant authoring change with a build and the narrow UI/validation test that exercises it. `tests/editors-ui.ts` covers editor save/reload by type; `tests/ui.ts` covers both creation flows.
