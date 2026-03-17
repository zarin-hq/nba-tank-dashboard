import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App'
import StyleGuide from './StyleGuide'
import FreeAgency from './pages/FreeAgency'
import DraftHistory from './pages/DraftHistory'
import Layout from './components/Layout'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/jazz-lottery-watch" element={<App />} />
          <Route path="/free-agency" element={<FreeAgency />} />
          <Route path="/draft-history" element={<DraftHistory />} />
        </Route>
        <Route path="/style-guide" element={<StyleGuide />} />
        <Route path="/lottery-watch" element={<Navigate to="/jazz-lottery-watch" replace />} />
        <Route path="/" element={<Navigate to="/jazz-lottery-watch" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
