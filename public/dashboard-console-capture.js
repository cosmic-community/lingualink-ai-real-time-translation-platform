(function () {
  if (window.self === window.top) return;

  const logs = [];
  const MAX_LOGS = 500;

  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
    debug: console.debug
  };

  function captureLog(level, args) {
    const timestamp = new Date().toISOString();
    const message = args.map(arg => {
      if (typeof arg === 'object' && arg !== null) {
        try {
          return JSON.stringify(arg, (key, value) => {
            if (typeof value === 'function') return '[Function]';
            if (value instanceof Error) return value.toString();
            return value;
          }, 2);
        } catch (e) {
          return '[Object]';
        }
      }
      return String(arg);
    }).join(' ');

    const logEntry = {
      timestamp,
      level,
      message,
      url: window.location.href
    };

    logs.push(logEntry);
    if (logs.length > MAX_LOGS) {
      logs.shift();
    }

    try {
      window.parent.postMessage({
        type: 'console-log',
        log: logEntry
      }, '*');
    } catch (e) { }
  }

  // Override console methods
  console.log = function(...args) {
    originalConsole.log.apply(console, args);
    captureLog('log', args);
  };

  console.warn = function(...args) {
    originalConsole.warn.apply(console, args);
    captureLog('warn', args);
  };

  console.error = function(...args) {
    originalConsole.error.apply(console, args);
    captureLog('error', args);
  };

  console.info = function(...args) {
    originalConsole.info.apply(console, args);
    captureLog('info', args);
  };

  console.debug = function(...args) {
    originalConsole.debug.apply(console, args);
    captureLog('debug', args);
  };

  // Capture unhandled errors
  window.addEventListener('error', (event) => {
    captureLog('error', [`Uncaught ${event.error ? event.error.toString() : event.message}`]);
  });

  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    captureLog('error', [`Unhandled Promise Rejection: ${event.reason}`]);
  });

  function sendReady() {
    try {
      window.parent.postMessage({
        type: 'console-capture-ready',
        url: window.location.href,
        timestamp: new Date().toISOString()
      }, '*');
    } catch (e) { }
  }

  function sendRouteChange() {
    try {
      window.parent.postMessage({
        type: 'route-change',
        route: {
          pathname: window.location.pathname,
          search: window.location.search,
          hash: window.location.hash,
          href: window.location.href
        },
        timestamp: new Date().toISOString()
      }, '*');
    } catch (e) { }
  }

  // Send ready message when page loads
  if (document.readyState === 'complete') {
    sendReady();
    setTimeout(sendRouteChange, 100);
  } else {
    window.addEventListener('load', () => {
      sendReady();
      setTimeout(sendRouteChange, 100);
    });
  }

  // Monitor route changes
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function(...args) {
    originalPushState.apply(this, args);
    setTimeout(sendRouteChange, 100);
  };

  history.replaceState = function(...args) {
    originalReplaceState.apply(this, args);
    setTimeout(sendRouteChange, 100);
  };

  window.addEventListener('popstate', () => {
    setTimeout(sendRouteChange, 100);
  });

  window.addEventListener('hashchange', () => {
    setTimeout(sendRouteChange, 100);
  });
})();