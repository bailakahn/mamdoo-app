const fs = require("fs");
const path = require("path");

const clientEn = require("_utils/lang/client/en").default;
const clientFr = require("_utils/lang/client/fr").default;
const partnerEn = require("_utils/lang/partner/en").default;
const partnerFr = require("_utils/lang/partner/fr").default;

// Mirrors utils/lang/index.js exactly: t() reads client only, t2() reads a
// shallow per-language merge of client + partner. A key only present in one
// namespace still resolves through t2 as long as nothing in the other product
// redefines that same top-level namespace name.
const T_DICT = { en: clientEn, fr: clientFr };
const T2_DICT = { en: { ...clientEn, ...partnerEn }, fr: { ...clientFr, ...partnerFr } };

const SRC_ROOT = path.resolve(__dirname, "../src");

const walk = (dir, out = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith(".js")) out.push(full);
  }
  return out;
};

// Matches t("a.b.c") / t2("a.b.c", {...}) with single, double or backtick
// quotes. Deliberately simple regex rather than a full AST parse — this only
// needs to catch string-literal keys, which is how every call site in this
// codebase is written (a dynamically-built key would defeat static checking
// either way).
const CALL_PATTERN = /\bt(2?)\(\s*["'`]([\w.]+)["'`]/g;

const resolves = (dict, scope) => {
  const parts = scope.split(".");
  let node = dict;
  for (const part of parts) {
    if (node == null || typeof node !== "object" || !(part in node)) return false;
    node = node[part];
  }
  return typeof node === "string";
};

describe("i18n key completeness", () => {
  const files = walk(SRC_ROOT);
  const missing = [];

  for (const file of files) {
    const code = fs.readFileSync(file, "utf8");
    let match;
    while ((match = CALL_PATTERN.exec(code))) {
      const isT2 = match[1] === "2";
      const scope = match[2];
      const dict = isT2 ? T2_DICT : T_DICT;

      for (const lang of ["en", "fr"]) {
        if (!resolves(dict[lang], scope)) {
          missing.push(`${path.relative(SRC_ROOT, file)}: ${isT2 ? "t2" : "t"}("${scope}") missing in ${lang}`);
        }
      }
    }
  }

  it("has a matching key in both languages for every t()/t2() call", () => {
    expect(missing).toEqual([]);
  });
});
