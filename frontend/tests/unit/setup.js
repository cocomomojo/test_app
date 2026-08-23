import { config } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

const vuetify = createVuetify({ components, directives });

config.global.plugins = [vuetify];

// Vuetify uses ResizeObserver
if (!global.ResizeObserver) {
  global.ResizeObserver = class {
    observe() { }
    unobserve() { }
    disconnect() { }
  };
}

// Some Vuetify components access matchMedia
if (!global.matchMedia) {
  global.matchMedia = () => ({
    matches: false,
    addListener: () => { },
    removeListener: () => { },
    addEventListener: () => { },
    removeEventListener: () => { },
    dispatchEvent: () => false
  });
}

if (!global.visualViewport) {
  global.visualViewport = {
    width: 1024,
    height: 768,
    scale: 1,
    offsetLeft: 0,
    offsetTop: 0,
    pageLeft: 0,
    pageTop: 0,
    addEventListener: () => { },
    removeEventListener: () => { }
  };
}
