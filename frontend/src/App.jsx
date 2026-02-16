import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Genomics from './pages/Genomics'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/genomics" element={<Genomics />} />
      </Routes>
    </BrowserRouter>
  )
}
