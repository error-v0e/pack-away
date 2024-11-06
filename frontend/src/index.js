import { NextUIProvider } from "@nextui-org/react";
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <NextUIProvider>
    <React.StrictMode>
      <div className="w-screen h-screen p-8 flex items-start justify-center">
        <App />
      </div>  
    </React.StrictMode>
  </NextUIProvider>
);