import { Routes, Route, Navigate } from 'react-router-dom'
import './bootstrap'
import Login from './pages/Login'
import Layout from './components/Layout'
import Products from './pages/Products'
import Customers from './pages/Customers'
import Users from './pages/Users'
import { AuthProvider } from './contexts/AuthContext'
import RequireAuth from './components/RequireAuth'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/admin" element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }>
          <Route index element={<Navigate to="/admin/products" replace />} />
          <Route path="products" element={<Products />} />
          <Route path="customers" element={<Customers />} />
          <Route path="users" element={<Users />} />
        </Route>
        
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="*" element={<div className="p-8 text-center">Page not found</div>} />
      </Routes>
    </AuthProvider>
  )
}
