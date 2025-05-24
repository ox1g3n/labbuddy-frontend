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

// Define global objects for the test environment
// Using globalThis instead of global for better ESM compatibility
Object.defineProperty(globalThis, 'localStorage', {
  value: new LocalStorageMock(),
});

globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder;
