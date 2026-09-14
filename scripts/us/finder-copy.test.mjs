import assert from "node:assert/strict";
import test from "node:test";

import { usFinderReasonLabel } from "../../lib/us/finder-copy.ts";

test("unknown finder facts are described as data gaps rather than documented conflicts", () => {
  assert.equal(
    usFinderReasonLabel("capacity:at-least-6", "unknown"),
    "Seated capacity is not documented for this configuration.",
  );
  assert.equal(
    usFinderReasonLabel("placement:outdoor", "unknown"),
    "Placement suitability is not documented for this configuration.",
  );
  assert.equal(
    usFinderReasonLabel("heat-type:traditional", "unknown"),
    "The heat type is not documented for this configuration.",
  );
});

test("documented finder conflicts keep explicit mismatch copy", () => {
  assert.equal(
    usFinderReasonLabel("capacity:at-least-6", "mismatch"),
    "The documented seated capacity is below the number entered.",
  );
  assert.equal(
    usFinderReasonLabel("electrical:supply-option", "mismatch"),
    "The documented electrical supply does not match the selection.",
  );
});
