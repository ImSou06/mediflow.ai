import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import QueueTracker from './pages/QueueTracker'
import Bookings from './pages/Bookings'
import Emergency from './pages/Emergency'
import AISmartReport from './pages/AISmartReport'

function App() {
  return (
    <BrowserRouter>
      <div className="bg-surface text-on-surface antialiased min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/queue" element={<QueueTracker />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/emergency" element={<Emergency />} />
            <Route path="/ai-report" element={<AISmartReport />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
