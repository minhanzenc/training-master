import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Spin } from 'antd'

export default function RequireAuth({ children }) {
    const { user, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spin size="large" tip="Đang kiểm tra đăng nhập..." />
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />
    }

    return children
}
