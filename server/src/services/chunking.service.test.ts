import test from "node:test";
import assert from "node:assert/strict";
import { getPageNumberForOffset } from "./chunking.service";

const pages = [
  { pageNumber: 1, startOffset: 0, endOffset: 5 },
  { pageNumber: 2, startOffset: 7, endOffset: 11 },
];

test("page offset end boundaries are exclusive", () => {
  assert.equal(getPageNumberForOffset(4, pages), 1);
  assert.equal(getPageNumberForOffset(7, pages), 2);
  assert.equal(getPageNumberForOffset(10, pages), 2);
});
