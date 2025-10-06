import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ListView from './components/ListView';
import GalleryView from './components/GalleryView';
import DetailView from './components/DetailView';
import 'normalize.css';
import './App.css';

function App() {
  return (
    <BrowserRouter basename="/mp2">
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<ListView />} />
          <Route path="/gallery" element={<GalleryView />} />
          <Route path="/pokemon/:id" element={<DetailView />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
