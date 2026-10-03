import copy
import json
import re
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "server" / "ai"))
from pdf_import import _normalize_imported_passage, inspect_bundle, persist_bundle  # noqa: E402


def sample_bundle():
    guide = (ROOT / "docs" / "reading-ui" / "PROMPT_AI_CHUYEN_DE_SANG_JSON.md").read_text(encoding="utf-8")
    match = re.search(r"## Ví dụ JSON rút gọn:[\s\S]*?```json\s*([\s\S]*?)\s*```", guide)
    return json.loads(match.group(1))


class PdfImportTest(unittest.TestCase):
    def test_valid_sample(self):
        checked = inspect_bundle(sample_bundle(), "single_passage_bundle")
        self.assertFalse(checked["errors"], checked["errors"])
        self.assertEqual(len(checked["bundle"]["passages"][0]["content"]["questionGroups"]), 2)

    def test_missing_answers_are_draft_warnings(self):
        value = sample_bundle()
        value["passages"][0]["answerKey"]["answers"] = value["passages"][0]["answerKey"]["answers"][:1]
        checked = inspect_bundle(value)
        self.assertFalse(checked["errors"], checked["errors"])
        self.assertEqual(len(checked["bundle"]["passages"][0]["answerKey"]["answers"]), 3)
        self.assertTrue(any("thiếu đáp án" in item for item in checked["warnings"]))

    def test_unknown_type_and_cross_passage_ids_are_rejected(self):
        invalid = sample_bundle()
        invalid["passages"][0]["content"]["questionGroups"][0]["type"] = "made_up_type"
        self.assertTrue(inspect_bundle(invalid)["errors"])
        full = sample_bundle()
        full["kind"] = "full_test_bundle"
        full["passages"] = [copy.deepcopy(full["passages"][0]) for _ in range(3)]
        self.assertTrue(any("reuses question ID" in item for item in inspect_bundle(full)["errors"]))

    def test_selected_workflow_is_enforced(self):
        self.assertTrue(inspect_bundle(sample_bundle(), "full_test_bundle")["errors"])
        full = sample_bundle()
        full["kind"] = "full_test_bundle"
        full["passages"] = [copy.deepcopy(full["passages"][0]) for _ in range(3)]
        self.assertTrue(inspect_bundle(full, "single_passage_bundle")["errors"])

    def test_ai_draft_normalization_removes_unpublishable_alternatives(self):
        value = sample_bundle()["passages"][0]
        group = value["content"]["questionGroups"][1]
        group["settings"]["maxWords"] = 1
        answer = value["answerKey"]["answers"][-1]
        answer["acceptedAnswers"] = ["gardens", "community gardens"]
        answer["evidence"] = [{"sectionId": "missing", "blockId": "missing", "quote": "not verbatim"}]
        warnings = _normalize_imported_passage(value["content"], value["answerKey"], 0)
        self.assertEqual(answer["acceptedAnswers"], ["gardens"])
        self.assertEqual(answer["evidence"], [])
        self.assertTrue(warnings)

    def test_atomic_sqlite_persistence(self):
        schema_sql = (ROOT / "server" / "migrations" / "001_reading.sql").read_text(encoding="utf-8")
        import sqlite3
        with tempfile.TemporaryDirectory() as directory:
            database = Path(directory) / "reading.sqlite"
            connection = sqlite3.connect(database)
            connection.executescript(schema_sql)
            connection.close()
            checked = inspect_bundle(sample_bundle())
            checked["model"] = "test-model"
            result = persist_bundle(database, checked)
            connection = sqlite3.connect(database)
            self.assertEqual(connection.execute("SELECT COUNT(*) FROM passage_versions").fetchone()[0], 1)
            self.assertEqual(connection.execute("SELECT COUNT(*) FROM single_passage_exercises").fetchone()[0], 1)
            connection.close()
            self.assertEqual(result["model"], "test-model")


if __name__ == "__main__":
    unittest.main()
