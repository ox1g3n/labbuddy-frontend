import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Toaster } from 'react-hot-toast';
import { initStorageSync, listenForLogout } from './utils/storageSync';

// Initialize cross-tab storage synchronization
initStorageSync();
listenForLogout();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster />
  </React.StrictMode>
);
