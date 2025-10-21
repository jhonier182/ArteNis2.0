import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// Crear root de React 18
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Renderizar la aplicación
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
