const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..', '..');
const modulesRoot = path.join(repoRoot, 'apps', 'api', 'src', 'modules');

const requiredModuleEntries = ['README.md', 'api', 'contract', 'entities', 'use-cases', 'infra'];

function listDirectories(absolutePath) {
  return fs
    .readdirSync(absolutePath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function walkFiles(absolutePath) {
  const files = [];
  const entries = fs.readdirSync(absolutePath, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(absolutePath, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(entryPath));
      continue;
    }

    if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

function validatePhase18Structure() {
  const failures = [];
  const moduleNames = listDirectories(modulesRoot);

  for (const moduleName of moduleNames) {
    const modulePath = path.join(modulesRoot, moduleName);

    for (const requiredEntry of requiredModuleEntries) {
      const entryPath = path.join(modulePath, requiredEntry);
      if (!fs.existsSync(entryPath)) {
        failures.push(`[${moduleName}] missing required entry: ${requiredEntry}`);
      }
    }

    const moduleFile = path.join(modulePath, `${moduleName}.module.ts`);
    if (!fs.existsSync(moduleFile)) {
      failures.push(`[${moduleName}] missing module file: ${moduleName}.module.ts`);
    }

    const useCasesRoot = path.join(modulePath, 'use-cases');
    if (!fs.existsSync(useCasesRoot)) {
      continue;
    }

    const useCaseEntries = fs.readdirSync(useCasesRoot, { withFileTypes: true });

    for (const entry of useCaseEntries) {
      if (entry.isFile() && entry.name !== '.gitkeep') {
        failures.push(
          `[${moduleName}] one-use-case-per-folder violated: file "${entry.name}" is directly inside use-cases/`
        );
      }

      if (!entry.isDirectory()) {
        continue;
      }

      const useCaseFolderPath = path.join(useCasesRoot, entry.name);
      const useCaseFiles = fs
        .readdirSync(useCaseFolderPath, { withFileTypes: true })
        .filter((child) => child.isFile())
        .map((child) => child.name);

      const useCaseFileCount = useCaseFiles.filter((name) => name === 'use-case.ts').length;
      if (useCaseFileCount !== 1) {
        failures.push(
          `[${moduleName}] use-case folder "${entry.name}" must contain exactly one use-case.ts (found ${useCaseFileCount})`
        );
      }
    }

    const dtoFiles = walkFiles(modulePath).filter((filePath) => path.basename(filePath) === 'dto.ts');
    for (const dtoFilePath of dtoFiles) {
      const relativePath = path.relative(modulePath, dtoFilePath);
      const segments = relativePath.split(path.sep);
      const isLocalDto = segments.length === 3 && segments[0] === 'use-cases' && segments[2] === 'dto.ts';

      if (!isLocalDto) {
        failures.push(
          `[${moduleName}] DTO locality violated: "${relativePath}" must be under use-cases/<use-case>/dto.ts`
        );
      }
    }
  }

  return failures;
}

const failures = validatePhase18Structure();
if (failures.length > 0) {
  console.error('Phase 18 structure drift check failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Phase 18 structure drift check passed.');
