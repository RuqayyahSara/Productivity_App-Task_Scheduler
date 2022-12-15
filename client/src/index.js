import React from 'react';
import ReactDOM from 'react-dom/client';

import '@coreui/coreui/dist/css/coreui.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import { BrowserRouter as Router } from "react-router-dom";

import App from './App';





const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <App />
  </Router>
);

