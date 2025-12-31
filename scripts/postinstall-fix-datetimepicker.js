/**
 * EAS Android build hotfix:
 * - @react-native-community/datetimepicker Kotlin compilation can fail under newer Kotlin
 *   with: "Function invocation 'getCurrentActivity()' expected."
 * - Fix by calling getCurrentActivity() explicitly instead of relying on Java getter -> Kotlin property mapping.
 *
 * This script runs in postinstall (CI/EAS), patches files in node_modules in-place.
 * It is safe and idempotent.
 */

const fs = require("fs");
const path = require("path");

function patchFile(filePath, replacers) {
  if (!fs.existsSync(filePath)) return { ok: true, changed: false, reason: "missing" };
  const before = fs.readFileSync(filePath, "utf8");
  let after = before;
  for (const { from, to } of replacers) {
    after = after.replace(from, to);
  }
  if (after === before) return { ok: true, changed: false, reason: "nochange" };
  fs.writeFileSync(filePath, after, "utf8");
  return { ok: true, changed: true, reason: "patched" };
}

function main() {
  const base = path.join(
    process.cwd(),
    "node_modules",
    "@react-native-community",
    "datetimepicker",
    "android",
    "src",
    "main",
    "java",
    "com",
    "reactcommunity",
    "rndatetimepicker"
  );

  const files = [
    path.join(base, "MaterialDatePickerModule.kt"),
    path.join(base, "MaterialTimePickerModule.kt"),
  ];

  const replacers = [
    {
      from: /val activity = currentActivity\b/g,
      to: "val activity = getCurrentActivity()",
    },
  ];

  let changedAny = false;
  for (const f of files) {
    const r = patchFile(f, replacers);
    if (!r.ok) {
      // Don't fail install; prefer build continuity.
      // eslint-disable-next-line no-console
      console.warn(`[postinstall] datetimepicker patch failed for ${f}`);
      continue;
    }
    if (r.changed) changedAny = true;
  }

  // eslint-disable-next-line no-console
  console.log(
    `[postinstall] datetimepicker Kotlin patch ${changedAny ? "APPLIED" : "SKIPPED"}`
  );
}

main();


