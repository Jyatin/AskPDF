import test from "node:test";
import assert from "node:assert/strict";
import { buildPDFExtractionResult } from "./pdf.service";

test("page offsets are built from the exact canonical text", () => {
  const result = buildPDFExtractionResult(["  Alpha  ", "Beta\n"], 2);
  assert.equal(result.text, "Alpha\n\nBeta");
  assert.equal(result.textLength, result.text.length);
  assert.deepEqual(result.pageOffsets, [
    { pageNumber: 1, startOffset: 0, endOffset: 5 },
    { pageNumber: 2, startOffset: 7, endOffset: 11 },
  ]);
  for (const page of result.pageOffsets) {
    assert.ok(result.text.slice(page.startOffset, page.endOffset).length > 0);
  }
});
