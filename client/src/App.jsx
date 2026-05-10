import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

// TODO: replace HomePlaceholder with the actual landing page once built
function HomePlaceholder() {
  return (
    <div className="min-h-screen bg-[#e8ddb4] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2 text-[#767f9e]">Welcome to Traveloop!</h1>
        <p className="text-[#3d4460] text-sm">Landing page coming soon...</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<Navigate to="/login" replace />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home"     element={<HomePlaceholder />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
