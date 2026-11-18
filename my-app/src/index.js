import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';

const msalConfig = {
    auth: {
        clientId: "a89ec5d4-9931-497d-8c37-227f913b859a",
        authority: "https://login.microsoftonline.com/3a6ff682-9d09-485b-8d4e-7d9981805487",
        redirectUri: "http://localhost:3000"
    },
    cache: {
        cacheLocation: "localStorage"
    }
};

const msalInstance = new PublicClientApplication(msalConfig);

ReactDOM.createRoot(document.getElementById('root')).render(
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
)
