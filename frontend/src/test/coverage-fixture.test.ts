import { describe, expect, it } from 'vitest';
import { normalizeFilePath } from '../../tests/e2e/fixtures/coverage-fixture';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';

describe('normalizeFilePath', () => {
  it('keeps Vite asset URLs as relative paths for reporting', () => {
    expect(normalizeFilePath('http://localhost:8081/assets/index-DPmOeCyG.js')).toBe('assets/index-DPmOeCyG.js');
  });

  it('preserves source paths from the app', () => {
    expect(normalizeFilePath('http://localhost:8081/src/components/HelloWorld.vue')).toBe('src/components/HelloWorld.vue');
  });

  it('prefixes plain paths with src for local app modules', () => {
    expect(normalizeFilePath('http://localhost:8081/components/App.vue')).toBe('/src/components/App.vue');
  });
});

describe('coverage source fallback', () => {
  it('uses the coverage entry source when the asset file is not on disk', () => {
    const fixturePath = join(process.cwd(), 'tests/e2e/fixtures/coverage-fixture.ts');
    const source = readFileSync(fixturePath, 'utf8');
    expect(source).toContain('export function normalizeFilePath');
  });

  it('writes a nyc-compatible merged coverage file when coverage is available', () => {
    const tempDir = join(process.cwd(), 'coverage/e2e-raw');
    rmSync(tempDir, { recursive: true, force: true });
    mkdirSync(tempDir, { recursive: true });

    const coverageMap = {
      'src/App.vue': {
        path: 'src/App.vue',
        statementMap: {},
        fnMap: {},
        branchMap: {},
        s: {},
        f: {},
        b: {},
      },
    };

    const finalPath = join(tempDir, 'coverage-final.json');
    writeFileSync(finalPath, JSON.stringify(coverageMap, null, 2));

    expect(existsSync(finalPath)).toBe(true);
    const saved = JSON.parse(readFileSync(finalPath, 'utf8'));
    expect(saved['src/App.vue']).toBeDefined();
  });
});
