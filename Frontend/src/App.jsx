import React from 'react';
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Dashboard from './pages/Dashboard';

const App = () => {
  return (
    <div className=''>

      <Routes>
        <Route path="/" element={<Dashboard />} />
      </Routes>

    </div>
  )
}

export default App;