import test from "node:test";
import assert from "node:assert/strict";
import {
  limitContextByCharacters,
  resolvePageFromHistory,
} from "./chat.service";

test("generic pronouns do not silently pin a question to a previously mentioned page", () => {
  const history = [{ role: "user" as const, content: "Explain page 5." }];
  assert.equal(resolvePageFromHistory("What is this document about?", history), null);
  assert.equal(resolvePageFromHistory("What is on that page?", history), 5);
});

test("page-specific context respects the character budget", () => {
  const chunks = [{ content: "1234" }, { content: "5678" }, { content: "9" }];
  assert.deepEqual(limitContextByCharacters(chunks, 8), chunks.slice(0, 2));
});
