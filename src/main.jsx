import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './perf'; // aktifkan mode ringan di HP sebelum render
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
