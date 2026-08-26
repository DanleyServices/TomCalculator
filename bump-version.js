#!/usr/bin/env node
// Bumps the app version and stamps it into the home page.
//
//   node bump-version.js          -> 1.0.51 becomes 1.0.52
//   node bump-version.js minor    -> 1.0.51 becomes 1.1.0
//   node bump-version.js major    -> 1.0.51 becomes 2.0.0
//   node bump-version.js 1.2.3    -> sets that exact version
//
// VERSION is the single source of truth; index.html is stamped from it.

const fs = require('fs');

const VERSION_FILE = 'VERSION';
const PAGE = 'index.html';
const BADGE = /(<div class="app-version" id="appVersion">v)([0-9]+\.[0-9]+\.[0-9]+)(<\/div>)/;

function read() {
  if (!fs.existsSync(VERSION_FILE)) return '1.0.50';
  return fs.readFileSync(VERSION_FILE, 'utf8').trim();
}

function next(current, arg) {
  if (arg && /^[0-9]+\.[0-9]+\.[0-9]+$/.test(arg)) return arg;
  const [major, minor, patch] = current.split('.').map(Number);
  if (arg === 'major') return `${major + 1}.0.0`;
  if (arg === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

const current = read();
const version = next(current, process.argv[2]);

let page = fs.readFileSync(PAGE, 'utf8');
if (!BADGE.test(page)) {
  console.error(`${PAGE} has no version badge to stamp - expected <div class="app-version" id="appVersion">`);
  process.exit(1);
}
page = page.replace(BADGE, `$1${version}$3`);

fs.writeFileSync(PAGE, page);
fs.writeFileSync(VERSION_FILE, version + '\n');
console.log(`${current} -> ${version}`);
