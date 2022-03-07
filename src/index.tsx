import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { Web3Provider } from './web3';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <HashRouter>
      <Web3Provider>
        <ToastContainer />
        <App />
      </Web3Provider>
    </HashRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
