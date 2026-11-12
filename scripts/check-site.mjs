#!/usr/bin/env node
// Structural checks for the single-page portfolio.
//
// Fails when the page would break for a visitor: missing head metadata, duplicate
// ids, in-page links that point nowhere, local assets that are not in the repo,
// or an inline script that does not parse.
//
// Usage: node scripts/check-site.mjs

import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(root, "index.html"), "utf8");

const failures = [];
const fail = (msg) => failures.push(msg);

// --- head metadata ---------------------------------------------------------
const required = [
  [/<!DOCTYPE html>/i, "missing <!DOCTYPE html>"],
  [/<html[^>]*\blang=["'][^"']+["']/i, "missing lang attribute on <html>"],
  [/<title>[^<]+<\/title>/i, "missing or empty <title>"],
  [/<meta[^>]+name=["']viewport["']/i, "missing viewport meta"],
  [/<meta[^>]+name=["']description["'][^>]*content=["'][^"']+["']/i, "missing description meta"],
];

for (const [pattern, message] of required) {
  if (!pattern.test(html)) fail(message);
}

// --- ids: unique, and every in-page link resolves ---------------------------
const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map((m) => m[1]);
const seen = new Set();
for (const id of ids) {
  if (seen.has(id)) fail(`duplicate id "${id}"`);
  seen.add(id);
}

for (const [, target] of html.matchAll(/href=["']#([^"']*)["']/g)) {
  if (target === "") continue; // href="#" is a placeholder, not a section
  if (!seen.has(target)) fail(`in-page link "#${target}" has no matching id`);
}

// --- local assets exist -----------------------------------------------------
for (const [, url] of html.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)) {
  if (/^(?:[a-z]+:|\/\/|#|data:)/i.test(url)) continue; // absolute, protocol-relative, anchor, data URI
  const path = url.split(/[?#]/)[0];
  if (path && !existsSync(join(root, path))) {
    fail(`local reference "${url}" does not exist`);
  }
}

// --- inline scripts parse ---------------------------------------------------
let scriptIndex = 0;
for (const [, attrs, code] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)) {
  if (/\bsrc=/.test(attrs) || code.trim() === "") continue;
  scriptIndex += 1;
  try {
    // Parse only; never execute.
    new Function(code);
  } catch (error) {
    fail(`inline script #${scriptIndex} does not parse: ${error.message}`);
  }
}

// --- report -----------------------------------------------------------------
if (failures.length > 0) {
  console.error(`check-site: ${failures.length} problem(s) in index.html`);
  for (const message of failures) console.error(`  - ${message}`);
  process.exit(1);
}

console.log(`check-site: OK (${ids.length} ids, ${scriptIndex} inline script(s))`);
