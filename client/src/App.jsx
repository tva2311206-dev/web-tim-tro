import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import RoomDetailPage from './pages/RoomDetailPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PostRoomPage from './pages/PostRoomPage'
import AiAssistantPage from './pages/AiAssistantPage'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'
import NotFoundPage from './pages/NotFoundPage'
import { useAuthStore } from './store/authStore'

function ProtectedRoute({ children }) {
  const { token } = useAuthStore()
  if (!token) return <Navigate to="/dang-nhap" replace />
  return children
}

function AdminRoute({ children }) {
  const { token, user } = useAuthStore()
  if (!token) return <Navigate to="/dang-nhap" replace />
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#173B57',
            color: '#fff',
            borderRadius: '12px',
            fontFamily: '"Be Vietnam Pro", sans-serif',
          },
          success: { style: { background: '#1a7a4a' } },
          error: { style: { background: '#dc2626' } },
        }}
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="tim-phong" element={<SearchPage />} />
          <Route path="phong/:id" element={<RoomDetailPage />} />
          <Route path="dang-nhap" element={<LoginPage />} />
          <Route path="dang-ky" element={<RegisterPage />} />
          <Route path="tro-ly-ai" element={<AiAssistantPage />} />
          <Route path="dang-tin" element={
            <ProtectedRoute><PostRoomPage /></ProtectedRoute>
          } />
          <Route path="tai-khoan" element={
            <ProtectedRoute><DashboardPage /></ProtectedRoute>
          } />
          <Route path="admin" element={
            <AdminRoute><AdminPage /></AdminRoute>
          } />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
