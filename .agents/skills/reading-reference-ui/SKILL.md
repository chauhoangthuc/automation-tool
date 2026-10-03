---
name: reading-reference-ui
description: Build or review IELTS Reading preview and learner UI against the copied reference images in this project, including question-type panels and responsive navigation.
---

# Reading reference UI

Apply this skill when editing preview layout, question renderers, or screenshot comparisons.

- Read `docs/reading-ui/IMAGE_MANIFEST.md` to map images to types, then inspect the relevant image files in `docs/reading-ui/references/`. `00-shell-tfng.png` defines header, left passage, right question panel, and footer; each named type image defines its **right panel**. The images are reference UI, not content to use as a background or hardcoded question data.
- Keep passage on the left and one selected group on the right. Footer numbers navigate all questions; a full test also switches Passage 1/2/3. Title and description stay together in the left passage. Instruction, answer format, and NB belong to the selected group.
- The same renderers serve admin preview and published learner views. Before submission, choices are selected states rather than correctness; after server grading, show result and per-question review/evidence without leaking keys in public pre-review responses.
- Compare screenshots at the reference desktop viewport (1586×992 for preview). Admin screenshots use 1440×900. `tests/screenshots.ts` and `tests/admin-screenshots.ts` generate output in `docs/reading-ui/screenshots/`; inspect actual images before claiming a match.
- Four required variants lack a final image: `note_completion_text`, `note_completion_word_box`, `table_completion_word_box`, and `flowchart_completion_word_box`. Admin editor mockups and original brand assets are also absent. Build these from the spec and label them as needing user approval; do not claim pixel matching. `diagram_completion_word_box` is outside the required registry.
- Read `docs/reading-ui/IMPLEMENTATION_STATUS.md` when reporting comparison status. Run the relevant renderer/UI test or screenshot comparison after a visual change.
