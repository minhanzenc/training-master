import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
import { useAuth } from "../contexts/AuthContext";

export default function Layout({ pageTitle }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const menuItems = [
        { key: "/admin/products", label: "Sản phẩm", path: "/admin/products" },
        {
            key: "/admin/customers",
            label: "Khách hàng",
            path: "/admin/customers",
        },
        { key: "/admin/users", label: "Users", path: "/admin/users" },
    ];

    const isActive = (path) => {
        // Check if current path starts with the menu path
        // This will make /admin/products active for /admin/products, /admin/products/create, /admin/products/:id/edit
        return (
            location.pathname === path ||
            location.pathname.startsWith(path + "/")
        );
    };

    const getPageTitle = () => {
        if (location.pathname === "/admin/products")
            return "XÂY DỰNG MÀN QUẢN SẢN PHẨM";
        if (location.pathname === "/admin/customers")
            return "XÂY DỰNG MÀN QUẢN LÝ KHÁCH HÀNG";
        if (location.pathname === "/admin/users")
            return "XÂY DỰNG MÀN QUẢN LÝ USER";
        return "TRANG QUẢN TRỊ";
    };

    return (
        <div className="min-h-screen">
            <div style={{ background: "#60a5fa" }} className="py-4 text-center">
                <h1 className="text-white text-2xl font-bold m-0">
                    {getPageTitle()}
                </h1>
            </div>

            <header
                style={{ background: "#1a2332" }}
                className="px-6 py-3 flex items-center justify-between"
            >
                <div className="flex items-center space-x-4">
                    <div className="text-white text-lg font-semibold">
                        RiverCrane <span className="text-red-600">Vietnam</span>
                    </div>

                    <nav className="flex">
                        {menuItems.map((item) => (
                            <Link
                                key={item.key}
                                to={item.path}
                                style={{
                                    background: isActive(item.path)
                                        ? "#dc2626"
                                        : "#9ca3af",
                                    color: "white",
                                    padding: "8px 24px",
                                    fontWeight: "500",
                                    textDecoration: "none",
                                }}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center space-x-4 text-white">
                    <div className="flex items-center space-x-2">
                        <UserOutlined className="text-lg" />
                        <span>{user?.name || "Admin"}</span>
                    </div>
                    <Button
                        type="text"
                        icon={<LogoutOutlined />}
                        onClick={async () => {
                            await logout();
                            message.success("Đăng xuất thành công!");
                            navigate("/login", { replace: true });
                        }}
                        className="text-white hover:text-red-400"
                    >
                        Đăng xuất
                    </Button>
                </div>
            </header>

            <main className="p-0">
                <Outlet />
            </main>
        </div>
    );
}
