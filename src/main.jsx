// main.jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import Login from './pages/Login';
import Layout from './components/Layout';
import Account from './pages/Account';
import SignUp from './pages/Signup';
import CreatePost from './pages/CreatePost';
import Home from './pages/Home';
import PostDetails from './pages/PostDetails';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Router>
    <Layout> {/* Wrap your routes with the Layout component */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/account" element={<Account />} />
        <Route path="/createpost" element={<CreatePost />} />
        <Route path="/post/:postId" element={<PostDetails />} />
        {/* Add other routes here */}
      </Routes>
    </Layout>
  </Router>
);
