import { Button, Table, Tag, Input, Select, Space, Form, Switch } from "antd";
import {
    UserAddOutlined,
    EditOutlined,
    DeleteOutlined,
    UserOutlined,
    SearchOutlined,
    CloseOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import CustomModal from "../components/CustomModal";
import api from "../api/axios";
import { notify } from "../components/Toast";

export default function Users() {
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState("");
    const [searchEmail, setSearchEmail] = useState("");
    const [searchRole, setSearchRole] = useState("all");
    const [searchStatus, setSearchStatus] = useState("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create"); // 'create' or 'edit'
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleOpenModal = (mode, user = null) => {
        setModalMode(mode);
        setSelectedUser(user);
        setIsModalOpen(true);

        if (user) {
            form.setFieldsValue({
                name: user.name,
                email: user.email,
                group_role: user.group_role.toLowerCase(),
                is_active: user.is_active,
            });
        } else {
            form.resetFields();
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
        form.resetFields();
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            if (modalMode === "create") {
                await createUser(values);
            } else {
                await updateUser(selectedUser.id, values);
            }

            fetchUsers(); 
            handleCloseModal();
        } catch (error) {
            console.log("Validation failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get("admin/users");
            if (response.data.success) {
                const usersData = response.data.data.map((user) => ({
                    key: user.id.toString(),
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    group_role: user.group_role,
                    is_active: user.is_active,
                }));
                setUsers(usersData);
            }
        } catch (error) {
            notify(
                error.response?.data?.message || "Failed to fetch users",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };
    const createUser = async (userData) => {
        console.log("Creating user with data:", userData);
        try {
            const response = await api.post("admin/users", userData);
            if (response.data.success) {
                notify("User created successfully", "success");
            }
        } catch (error) {
            notify(
                error.response?.data?.message || "Failed to create user",
                "error"
            );
        }
    };

    const updateUser = async (id, userData) => {
        console.log("Updating user with id:", id, "data:", userData);
        // try {
        //     const response = await api.put(`/users/${id}`, userData);
        //     if (response.data.success) {
        //         notify('User updated successfully', 'success');
        //         // Cập nhật lại danh sách user nếu cần
        //     }
        // } catch (error) {
        //     notify(error.response?.data?.message || 'Failed to update user', 'error');
        // }
    };

    const columns = [
        {
            title: "#",
            dataIndex: "id",
            key: "id",
            width: 60,
        },
        {
            title: "Tên",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Role",
            dataIndex: "role",
            key: "role",
            render: (role) => (
                <Tag color={role === "admin" ? "red" : "blue"}>{role}</Tag>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={status === "active" ? "green" : "red"}>
                    {status === "active" ? "Hoạt động" : "Vô hiệu hóa"}
                </Tag>
            ),
        },
        {
            title: "Hành động",
            key: "action",
            width: 150,
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        className="text-blue-500"
                        onClick={() => handleOpenModal("edit", record)}
                    />
                    <Button
                        type="link"
                        icon={<UserOutlined />}
                        className="text-green-500"
                    />
                    <Button
                        type="link"
                        icon={<DeleteOutlined />}
                        className="text-red-500"
                    />
                </Space>
            ),
        },
    ];

    const data = [
        {
            key: "1",
            id: 1,
            name: "Nguyễn Văn A",
            email: "a.nguyen@gmail.com",
            group_role: "Admin",
            is_active: "active",
        },
        {
            key: "2",
            id: 2,
            name: "Nguyễn Văn B",
            email: "b.nguyen@gmail.com",
            group_role: "Editor",
            is_active: "active",
        },
        {
            key: "3",
            id: 3,
            name: "Nguyễn Văn C",
            email: "c.nguyen@gmail.com",
            group_role: "Reviewer",
            is_active: "inactive",
        },
        {
            key: "4",
            id: 4,
            name: "Nguyễn Văn D",
            email: "d.nguyen@gmail.com",
            group_role: "Admin",
            is_active: "active",
        },
        {
            key: "5",
            id: 5,
            name: "Nguyễn Văn E",
            email: "e.nguyen@gmail.com",
            group_role: "Reviewer",
            is_active: "inactive",
        },
        {
            key: "6",
            id: 6,
            name: "Nguyễn Văn F",
            email: "f.nguyen@gmail.com",
            group_role: "Editor",
            is_active: "inactive",
        },
        {
            key: "7",
            id: 7,
            name: "Nguyễn Văn G",
            email: "g.nguyen@gmail.com",
            group_role: "Reviewer",
            is_active: "active",
        },
        {
            key: "8",
            id: 8,
            name: "Nguyễn Văn H",
            email: "h.nguyen@gmail.com",
            group_role: "Reviewer",
            is_active: "active",
        },
        {
            key: "9",
            id: 9,
            name: "Nguyễn Văn I",
            email: "i.nguyen@gmail.com",
            group_role: "Reviewer",
            is_active: "inactive",
        },
        {
            key: "10",
            id: 10,
            name: "Nguyễn Văn K",
            email: "k.nguyen@gmail.com",
            group_role: "Reviewer",
            is_active: "inactive",
        },
    ];

    return (
        <div>
            <div className="p-6 bg-white">
                <div className="flex justify-start items-center mb-4">
                    <h2 className="text-lg font-semibold m-0">
                        Danh sách user
                    </h2>
                </div>

                {/* Search Filters */}
                <div className="mb-4 p-4 bg-gray-50 rounded">
                    <div className="grid grid-cols-4 gap-4">
                        <div>
                            <label className="block mb-2 text-sm font-medium">
                                Tên
                            </label>
                            <Input
                                placeholder="Nhập tên..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                allowClear
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium">
                                Email
                            </label>
                            <Input
                                placeholder="Nhập email..."
                                value={searchEmail}
                                onChange={(e) => setSearchEmail(e.target.value)}
                                allowClear
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium">
                                Nhóm
                            </label>
                            <Select
                                value={searchRole}
                                onChange={setSearchRole}
                                className="w-full"
                                options={[
                                    { value: "all", label: "Chọn nhóm" },
                                    { value: "admin", label: "Admin" },
                                    { value: "editor", label: "Editor" },
                                    { value: "reviewer", label: "Reviewer" },
                                ]}
                            />
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium">
                                Trạng thái
                            </label>
                            <Select
                                value={searchStatus}
                                onChange={setSearchStatus}
                                className="w-full"
                                options={[
                                    { value: "all", label: "Chọn trạng thái" },
                                    {
                                        value: "active",
                                        label: "Đang hoạt động",
                                    },
                                    { value: "inactive", label: "Tạm khóa" },
                                ]}
                            />
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <div className="mt-4">
                            <Button
                                type="primary"
                                icon={<UserAddOutlined />}
                                className="bg-green-500 hover:bg-green-600"
                                onClick={() => handleOpenModal("create")}
                            >
                                Thêm mới
                            </Button>
                        </div>
                        <div className="mt-4 flex gap-2">
                            <Button
                                type="primary"
                                icon={<SearchOutlined />}
                                className="bg-blue-500 hover:bg-blue-600"
                            >
                                Tìm kiếm
                            </Button>
                            <Button
                                icon={<CloseOutlined />}
                                onClick={() => {
                                    setSearchText("");
                                    setSearchEmail("");
                                    setSearchRole("all");
                                    setSearchStatus("all");
                                }}
                            >
                                Xóa bộ lọc
                            </Button>
                        </div>
                    </div>
                </div>

                <Table
                    columns={columns}
                    dataSource={users}
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total, range) =>
                            `Hiển thị từ ${range[0]}-${range[1]} trong ${total} dòng`,
                        pageSizeOptions: ["10", "20", "50", "100"],
                    }}
                    bordered
                />
            </div>

            <CustomModal
                open={isModalOpen}
                title={modalMode === "create" ? "Thêm User" : "Chỉnh sửa User"}
                onOk={handleSubmit}
                onCancel={handleCloseModal}
                confirmLoading={loading}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label={
                            <span>
                                Tên <span className="text-red-500">*</span>
                            </span>
                        }
                        rules={[
                            {
                                required: true,
                                message: "Họ và tên không được để trống",
                            },
                            {
                                min: 5,
                                message: "Họ và tên phải có ít nhất 5 ký tự",
                            },
                        ]}
                    >
                        <Input placeholder="Nhập họ tên" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label={
                            <span>
                                Email <span className="text-red-500">*</span>
                            </span>
                        }
                        rules={[
                            {
                                required: true,
                                message: "Email không được để trống",
                            },
                            {
                                type: "email",
                                message: "Email không đúng định dạng",
                            },
                            {
                                unique: true,
                                message: "Email đã tồn tại",
                            },
                        ]}
                    >
                        <Input placeholder="Nhập email" />
                    </Form.Item>

                    {modalMode === "create" && (
                        <>
                            <Form.Item
                                name="password"
                                label={
                                    <span>
                                        Mật khẩu{" "}
                                        <span className="text-red-500">*</span>
                                    </span>
                                }
                                rules={[
                                    {
                                        required: true,
                                        message: "Mật khẩu không được để trống",
                                    },
                                    {
                                        min: 5,
                                        message:
                                            "Mật khẩu phải có ít nhất 5 ký tự",
                                    },
                                    {
                                        pattern:
                                            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                                        message:
                                            "Mật khẩu phải bao gồm chữ hoa, chữ thường và số",
                                    },
                                ]}
                            >
                                <Input.Password placeholder="Mật khẩu" />
                            </Form.Item>

                            <Form.Item
                                name="password_confirmation"
                                label="Xác nhận"
                                dependencies={["password"]}
                                rules={[
                                    {
                                        required: true,
                                        message: "Vui lòng xác nhận mật khẩu",
                                    },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (
                                                !value ||
                                                getFieldValue("password") ===
                                                    value
                                            ) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(
                                                new Error(
                                                    "Mật khẩu xác nhận không khớp"
                                                )
                                            );
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password placeholder="Xác mật khẩu" />
                            </Form.Item>
                        </>
                    )}

                    <Form.Item
                        name="group_role"
                        label={
                            <span>
                                Nhóm <span className="text-red-500">*</span>
                            </span>
                        }
                        rules={[
                            { required: true, message: "Vui lòng chọn nhóm" },
                        ]}
                    >
                        <Select
                            placeholder="Chọn nhóm"
                            options={[
                                { value: "admin", label: "Admin" },
                                { value: "editor", label: "Editor" },
                                { value: "reviewer", label: "Reviewer" },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Trạng thái"
                        name="is_active"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>
                </Form>
            </CustomModal>
        </div>
    );
}
