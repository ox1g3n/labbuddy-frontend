import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**'] },

  // Base for all JS/JSX files - treat as ESM by default due to package.json type:module
  // This configuration will be refined by more specific configurations below.
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
  },

  // Configuration for CJS files (mocks, specific .cjs config files)
  {
    files: ['__mocks__/*.js', 'jest.config.cjs'],
    languageOptions: {
      sourceType: 'commonjs', // Override to CJS
      globals: globals.node,
    },
  },

  // Configuration for root-level JS config files (babel, vite, postcss, tailwind)
  // These are .js files, so ESM by default in this project. They run in Node.
  {
    files: [
      'babel.config.js',
      'vite.config.js',
      'postcss.config.js',
      'tailwind.config.js',
    ],
    languageOptions: {
      globals: globals.node, // Node environment
    },
  },

  // React application code (src)
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      globals: globals.browser, // Browser environment
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'react/react-in-jsx-scope': 'off', // Not needed with new JSX transform
      'no-unused-vars': [
        'warn',
        { vars: 'all', args: 'after-used', ignoreRestSiblings: true },
      ],
      'react/prop-types': 'warn',
    },
  },

  // Test files (Jest environment)
  {
    files: ['**/*.test.{js,jsx}', 'jest.setup.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.browser, // For DOM APIs, localStorage mock
        ...globals.node, // For TextEncoder/Decoder in jest.setup.js if needed
      },
    },
    rules: {
      // Add Jest specific rules if eslint-plugin-jest is used
    },
  },
];
