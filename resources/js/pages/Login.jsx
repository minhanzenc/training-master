import { useState, useEffect } from "react";
import { Form, Input, Button, Checkbox, Typography, Card, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import api, { getCsrfToken } from "../api/axios";
import { useAuth } from "../contexts/AuthContext";
import { notify } from "../components/Toast";

const { Title, Text } = Typography;

export default function Login() {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const location = useLocation();
    const { login, user } = useAuth();

    useEffect(() => {
        if (user) {
            const from = location.state?.from?.pathname || "/admin/users";
            navigate(from, { replace: true });
        }
    }, [user, navigate, location]);

    const onSubmit = async (values) => {
        setLoading(true);
        try {
            await getCsrfToken();
            const response = await api.post("/login", {
                email: values.email,
                password: values.password,
                remember: values.remember,
            });

            if (response.data.success) {
                login(response.data.user);
                notify(response.data.message, "success");

                const from = location.state?.from?.pathname || "/admin/users";
                navigate(from, { replace: true });
            }
        } catch (err) {
            notify(
                err.response?.data?.message || "Đăng nhập thất bại",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <Card className="w-full max-w-lg mx-4">
                <div className="text-center mb-8">
                    <Title level={3} className="!mb-2">
                        RiverCrane{" "}
                        <span className="text-red-600">Vietnam</span>
                    </Title>
                </div>

                <Form
                    form={form}
                    name="login"
                    onFinish={onSubmit}
                    autoComplete="off"
                    layout="vertical"
                >
                    <Form.Item
                        name="email"
                        rules={[
                            {
                                required: true,
                                message: "Email không được trống",
                            },
                            {
                                type: "email",
                                message: "Email không đúng định dạng",
                            },
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined className="text-gray-400" />}
                            placeholder="Email"
                            size="large"
                            className="rounded"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: "Mật khẩu không được trống",
                            },
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="text-gray-400" />}
                            placeholder="Mật khẩu"
                            size="large"
                            className="rounded"
                        />
                    </Form.Item>

                    <Form.Item
                        name="remember"
                        valuePropName="checked"
                        initialValue={false}
                    >
                        <Checkbox>Remember</Checkbox>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={loading}
                            className="w-full bg-blue-500 hover:bg-blue-600 rounded"
                        >
                            Đăng nhập
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}
