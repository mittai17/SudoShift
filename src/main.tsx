import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './auth/AuthContext.tsx';
import './index.css';

// Monkey patch fetch for mobile API base URL compatibility
const originalFetch = window.fetch;
window.fetch = function (input, init) {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  if (apiUrl && typeof input === 'string' && input.startsWith('/api/')) {
    input = `${apiUrl}${input}`;
  }
  return originalFetch.call(this, input, init);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
