
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Фильтрация ошибок от расширений браузера
window.addEventListener('unhandledrejection', (event) => {
  // Фильтруем ошибки расширений браузера
  if (event.reason && typeof event.reason === 'string') {
    if (event.reason.includes('message channel closed') || 
        event.reason.includes('listener indicated an asynchronous response')) {
      event.preventDefault();
      return;
    }
  }
});

// Фильтрация ошибок консоли
const originalError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  if (message.includes('message channel closed') || 
      message.includes('listener indicated an asynchronous response')) {
    return; // Не выводим эти ошибки
  }
  originalError.apply(console, args);
};

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Root element not found');

const root = createRoot(rootElement);
root.render(<App />);
