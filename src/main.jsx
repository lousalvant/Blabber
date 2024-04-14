// main.jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import Login from './components/Login';
import Layout from './components/Layout';
import Account from './components/Account';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Router>
    <Layout> {/* Wrap your routes with the Layout component */}
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login-signup" element={<Login />} />
        <Route path="/account" element={<Account />} />
        {/* Add other routes here */}
      </Routes>
    </Layout>
  </Router>
);
