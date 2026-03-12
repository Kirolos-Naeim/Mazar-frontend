// Simple frontend smoke test
const pkg = require('../package.json');

if (!pkg.name || !pkg.version) {
  console.error('Frontend smoke test failed: package.json is missing name or version');
  process.exit(1);
}

console.log(`Frontend smoke test passed for ${pkg.name}@${pkg.version}`);
