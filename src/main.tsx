import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryProvider } from '@/lib/providers/QueryProvider';
import { validateEnvironment, logEnvironment } from '@/lib/config/env';
import App from './App';
import './styles/globals.css';

// Initialize environment
const initEnvironment = () => {
  const validation = validateEnvironment();

  if (!validation.isValid) {
    console.error('❌ Environment Configuration Error:');
    validation.errors.forEach(error => console.error(`  - ${error}`));

    // In development, show a clear error message
    if (import.meta.env.DEV) {
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: #fee;
        color: #c00;
        padding: 20px;
        font-family: monospace;
        z-index: 9999;
        overflow: auto;
      `;
      errorDiv.innerHTML = `
        <h1>❌ Environment Configuration Error</h1>
        <p>The application cannot start due to missing environment variables:</p>
        <ul>
          ${validation.errors.map(error => `<li>${error}</li>`).join('')}
        </ul>
        <p>Please check your .env file and restart the development server.</p>
      `;
      document.body.appendChild(errorDiv);
      return false;
    }
  }

  // Log environment in development
  if (import.meta.env.DEV) {
    logEnvironment();
    console.log('✅ Environment validation passed');
  }

  return true;
};

// Only render app if environment is valid
if (initEnvironment()) {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryProvider>
    </React.StrictMode>,
  );
}