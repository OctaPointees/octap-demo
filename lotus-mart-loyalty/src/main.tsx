import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppContent } from './App';
import { LoyaltyProvider } from './context/LoyaltyContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LoyaltyProvider>
      <AppContent />
    </LoyaltyProvider>
  </StrictMode>
);
