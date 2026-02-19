import { StrictMode } from 'react';

// Global error handler to catch module loading errors
window.onerror = function (message, source, lineno, colno, error) {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="color: red; padding: 20px; background: #2a0000; height: 100vh;">
        <h1>Application Error</h1>
        <p>${message}</p>
        <pre>${source}:${lineno}:${colno}</pre>
        <pre>${error?.stack || ''}</pre>
      </div>
    `;
  }
};
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';
import { DataProvider } from './context/DataContext';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <DataProvider>
        <App />
      </DataProvider>
    </ErrorBoundary>
  </StrictMode>
);
