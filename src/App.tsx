
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Index from './pages/Index'
import SignIn from './pages/SignIn'
import App from './pages/App'
import Settings from './pages/Settings'
import Pricing from './pages/Pricing'
import Onboarding from './pages/Onboarding'
import NotFound from './pages/NotFound'

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/app" element={<App />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Router>
  )
}

export default AppRouter
