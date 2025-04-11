import './index.css'

import App from './App.tsx'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Initialize dark mode from localStorage
const initializeDarkMode = () => {
  try {
    const savedDarkMode = localStorage.getItem('darkModePreference');
    // Only use dark mode if explicitly set to 'true', otherwise default to light mode
    const prefersDark = savedDarkMode === 'true';
    
    if (prefersDark) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  } catch (error) {
    console.error('Error initializing dark mode:', error);
    // Default to light mode on error
    document.documentElement.classList.remove('dark-theme');
  }
};

// Run before rendering
initializeDarkMode();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
