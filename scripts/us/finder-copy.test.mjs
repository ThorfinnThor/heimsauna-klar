import assert from "node:assert/strict";
import test from "node:test";

import { usFinderReasonLabel } from "../../lib/us/finder-copy.ts";

test("unknown finder facts are described as data gaps rather than documented conflicts", () => {
  assert.equal(
    usFinderReasonLabel("capacity:at-least-6", "unknown"),
    "The number of seats isn't stated.",
  );
  assert.equal(
    usFinderReasonLabel("placement:outdoor", "unknown"),
    "The manufacturer doesn't say indoor or outdoor.",
  );
  assert.equal(
    usFinderReasonLabel("heat-type:traditional", "unknown"),
    "The kind of heat isn't stated.",
  );
});

test("documented finder conflicts keep explicit mismatch copy", () => {
  assert.equal(
    usFinderReasonLabel("capacity:at-least-6", "mismatch"),
    "It has fewer seats than you need.",
  );
  assert.equal(
    usFinderReasonLabel("electrical:supply-option", "mismatch"),
    "It needs a different electrical supply.",
  );
});
