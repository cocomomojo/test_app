import { describe, expect, it } from 'vitest';
import { normalizeFilePath } from '../../tests/e2e/fixtures/coverage-fixture';

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
