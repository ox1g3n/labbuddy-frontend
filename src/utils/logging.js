import { Browser } from '@logtail/browser';

let logtail = null;

export const initializeLogging = () => {
  if (!import.meta.env.VITE_LOGTAIL_SOURCE_TOKEN) {
    console.warn(
      'VITE_LOGTAIL_SOURCE_TOKEN not set. Centralized logging is disabled.'
    );
    return;
  }

  try {
    logtail = new Browser(import.meta.env.VITE_LOGTAIL_SOURCE_TOKEN);

    // Add context information to all logs
    logtail.use({
      enhancer: (payload) => {
        payload.metadata = {
          ...payload.metadata,
          environment: import.meta.env.MODE,
          service: 'labbuddy-frontend',
          version: import.meta.env.VITE_APP_VERSION || '1.0.0',
          userAgent: navigator.userAgent,
        };
        return payload;
      },
    });

    // Intercept console methods
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
    };

    // Override console methods
    console.log = (...args) => {
      originalConsole.log(...args);
      logtail.info(args.map((arg) => String(arg)).join(' '));
    };

    console.warn = (...args) => {
      originalConsole.warn(...args);
      logtail.warn(args.map((arg) => String(arg)).join(' '));
    };

    console.error = (...args) => {
      originalConsole.error(...args);
      logtail.error(args.map((arg) => String(arg)).join(' '));
    };

    // Global error handler
    window.onerror = (message, source, lineno, colno, error) => {
      logtail.error('Uncaught Error', {
        message,
        source,
        lineno,
        colno,
        stack: error?.stack,
      });
    };

    // Unhandled promise rejection handler
    window.onunhandledrejection = (event) => {
      logtail.error('Unhandled Promise Rejection', {
        reason:
          event.reason instanceof Error ? event.reason.stack : event.reason,
      });
    };

    console.log('Logtail logging configured successfully');
  } catch (error) {
    console.error('Failed to configure Logtail logging:', error);
  }
};

export const log = {
  info: (...args) => {
    if (logtail) logtail.info(args.map((arg) => String(arg)).join(' '));
  },
  warn: (...args) => {
    if (logtail) logtail.warn(args.map((arg) => String(arg)).join(' '));
  },
  error: (...args) => {
    if (logtail) logtail.error(args.map((arg) => String(arg)).join(' '));
  },
};
