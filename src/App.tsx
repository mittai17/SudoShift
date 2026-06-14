import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { ProtectedRoute } from './auth/ProtectedRoute';
import Home from './pages/Home';
import Editor from './pages/Editor';
import Login from './pages/Login';
import Profile from './pages/Profile';
import HowItWorks from './pages/HowItWorks';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/how-it-works" element={<ProtectedRoute><HowItWorks /></ProtectedRoute>} />
        <Route path="/app" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

