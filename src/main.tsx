import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// 💥 Force socket to connect as soon as app starts
import { socketService } from './utils/socket';

socketService.socket.connect(); 

console.log("💥 Initial connected state (may be false):", socketService.socket.connected);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);