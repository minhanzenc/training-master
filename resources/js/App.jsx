import { Routes, Route, Navigate } from "react-router-dom";
import "./bootstrap";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Users from "./pages/Users";
import NotFound from "./pages/404";
import { AuthProvider } from "./contexts/AuthContext";
import RequireAuth from "./components/RequireAuth";
import { ToastContainer } from "react-toastify";

export default function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route
                    path="/admin"
                    element={
                        <RequireAuth>
                            <Layout />
                        </RequireAuth>
                    }
                >
                    <Route
                        index
                        element={<Navigate to="/admin/products" replace />}
                    />
                    <Route path="products" element={<Products />} />
                    <Route path="customers" element={<Customers />} />
                    <Route path="users" element={<Users />} />
                </Route>

                <Route path="/" element={<Navigate to="/login" replace />} />

                <Route
                    path="*"
                    element={
                        < NotFound />
                    }
                />
            </Routes>
            <ToastContainer />
        </AuthProvider>
    );
}
