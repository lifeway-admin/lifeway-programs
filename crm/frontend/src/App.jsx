import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { RecentlyViewedProvider } from './context/RecentlyViewedContext'
import { DensityProvider } from './context/DensityContext'
import { ToastProvider } from './context/ToastContext'
import Login from './pages/Login'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import ClientProfile from './pages/ClientProfile'
import Appointments from './pages/Appointments'
import Donations from './pages/Donations'
import Staff from './pages/Staff'
import AIAgent from './pages/AIAgent'
import Tickets from './pages/Tickets'
import Home from './pages/Home'
import Reports from './pages/Reports'
import AuditLog from './pages/AuditLog'
import ChangePassword from './pages/ChangePassword'
import IntakeForm from './pages/IntakeForm'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <ThemeProvider>
      <DensityProvider>
        <RecentlyViewedProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/intake" element={<IntakeForm />} />
              <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route index element={<Navigate to="/home" replace />} />
                <Route path="home" element={<Home />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="clients" element={<Clients />} />
                <Route path="clients/:id" element={<ClientProfile />} />
                <Route path="appointments" element={<Appointments />} />
                <Route path="donations" element={<Donations />} />
                <Route path="staff" element={<Staff />} />
                <Route path="ai-agent" element={<AIAgent />} />
                <Route path="tickets" element={<Tickets />} />
                <Route path="reports" element={<Reports />} />
                <Route path="audit-log" element={<AuditLog />} />
                <Route path="change-password" element={<ChangePassword />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
        </RecentlyViewedProvider>
      </DensityProvider>
    </ThemeProvider>
  )
}
