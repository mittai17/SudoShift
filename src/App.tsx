import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { ProtectedRoute } from './auth/ProtectedRoute';
import Home from './pages/Home';
import Editor from './pages/Editor';
import Community from './pages/Community';
import Login from './pages/Login';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/app" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
        <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

