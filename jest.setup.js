import '@testing-library/jest-dom';

class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }
}

// Import TextEncoder and TextDecoder before using them
import { TextEncoder, TextDecoder } from 'util';

// Mock fetch
global.fetch = jest.fn(() => Promise.resolve({
  ok: true,
  json: () => Promise.resolve({}),
}));

// Define global objects for the test environment
Object.defineProperty(global, 'localStorage', {
  value: new LocalStorageMock(),
});

Object.defineProperty(global, 'sessionStorage', {
  value: new LocalStorageMock(),
});

// Mock window.location
delete window.location;
window.location = {
  pathname: '/',
  search: '',
  hash: '',
  href: 'http://localhost/',
  assign: jest.fn(),
  replace: jest.fn(),
};

// Mock Intersection Observer
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};
