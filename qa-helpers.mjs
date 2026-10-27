// Tiny assertion helpers shared by the qa-*.mjs scripts.
let failures = 0;
export function check(name, ok, detail = '') {
  if (ok) console.log('  ok   ' + name);
  else { failures++; console.error('  FAIL ' + name + (detail ? ' (' + detail + ')' : '')); }
}
export function done(title) {
  if (failures) { console.error(title + ': ' + failures + ' check(s) failed'); process.exit(1); }
  console.log(title + ': passed');
}
