// BrowserRouter must wrap everything that uses routing
// Putting it in main.tsx means your entire app has access to routing hooks

// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';  // ← ADD THIS
import App from './App';
import './index.css';
 
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>     {/* ← WRAP App here */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
