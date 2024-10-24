import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Instructor from './pages/Instructor';
import Evaluation from './pages/Evaluation';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="container">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/instructor" element={<Instructor />} />
          <Route path="/evaluation" element={<Evaluation />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
