import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Editor from './pages/Editor';
import Community from './pages/Community';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app" element={<Editor />} />
        <Route path="/community" element={<Community />} />
      </Routes>
    </BrowserRouter>
  );
}


