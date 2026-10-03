---
name: reading-project
description: Route work in this IELTS Reading project to the relevant authoring, data-contract, or reference-UI skill, especially when a task crosses those areas or concerns project-wide decisions.
---

# Reading project

Use this as the project entry point. Read `docs/reading-ui/PROJECT_DECISIONS.md` for the current decisions and their sources. The user's latest request takes precedence when a decision changes.

Load only the skill needed for the task; load more than one when the change crosses boundaries:

- Admin form, passage fields, question groups, answers, or authoring flow: `.agents/skills/reading-authoring/SKILL.md`.
- Schema, SQLite, API, publish rules, answer exposure, or grading: `.agents/skills/reading-data-contract/SKILL.md`.
- Preview, learner renderer, navigation, or comparison with reference images: `.agents/skills/reading-reference-ui/SKILL.md`.

For a new question type or a change to its answer format, use all three because editor, stored shape, validation, grading, renderer, and preview must agree. For documentation-only work, read the decision ledger and the specific source being edited; do not load unrelated skills. Update the ledger when an accepted product or architecture decision changes.
