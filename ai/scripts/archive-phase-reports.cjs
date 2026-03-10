const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..', '..');
const reportsDir = path.join(repoRoot, 'ai', 'phase-reports');
const archiveDir = path.join(reportsDir, 'archive');
const latestFile = path.join(reportsDir, 'latest.md');

function readLatestPhase() {
  const content = fs.readFileSync(latestFile, 'utf8');
  const match = content.match(/-\s*latest_phase:\s*([^\r\n]+)/);
  if (!match) {
    throw new Error('Could not find latest_phase in ai/phase-reports/latest.md');
  }
  return match[1].trim();
}

function isSameContent(a, b) {
  return fs.readFileSync(a, 'utf8') === fs.readFileSync(b, 'utf8');
}

function ensureArchiveDir() {
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true });
  }
}

function main() {
  ensureArchiveDir();
  const latestPhase = readLatestPhase();
  const latestFileName = `phase-${latestPhase}.md`;

  const reportFiles = fs
    .readdirSync(reportsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => /^phase-.+\.md$/.test(name));

  const moved = [];
  const skipped = [];

  for (const fileName of reportFiles) {
    if (fileName === latestFileName) {
      skipped.push(fileName);
      continue;
    }

    const source = path.join(reportsDir, fileName);
    const destination = path.join(archiveDir, fileName);

    if (fs.existsSync(destination)) {
      if (!isSameContent(source, destination)) {
        throw new Error(`Archive conflict: ${fileName} exists with different content.`);
      }
      fs.unlinkSync(source);
      moved.push(`${fileName} (deduplicated)`);
      continue;
    }

    fs.renameSync(source, destination);
    moved.push(fileName);
  }

  console.log(`Latest phase kept in root: ${latestFileName}`);
  console.log(`Moved ${moved.length} report(s) to ai/phase-reports/archive.`);
  for (const item of moved) {
    console.log(`- ${item}`);
  }

  if (skipped.length > 0) {
    console.log('Kept in root:');
    for (const item of skipped) {
      console.log(`- ${item}`);
    }
  }
}

main();