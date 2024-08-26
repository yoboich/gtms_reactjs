import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from "react-router-dom";
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import config from './config';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <TonConnectUIProvider actionsConfiguration={{twaReturnUrl: config.bot_url}} manifestUrl='https://arcane-bot.online/tonconnect-manifest.json'>
        <App />
      </TonConnectUIProvider>
    </BrowserRouter>
  </React.StrictMode>
);

