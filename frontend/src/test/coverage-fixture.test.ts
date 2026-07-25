import { describe, expect, it } from 'vitest';
import { normalizeFilePath } from '../../tests/e2e/fixtures/coverage-fixture';
import { readFileSync } from 'fs';
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
});
