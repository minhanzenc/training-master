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
import { formatUserData } from "../utils/UserUtils";
import {
    USER_STATUS,
    USER_ROLES,
    USER_STATUS_OPTIONS,
    USER_ROLE_OPTIONS
} from "../constant/UserConstant";

export default function Users() {
    const [form] = Form.useForm();
    const [searchForm] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create"); // 'create' or 'edit'
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    useEffect(() => {
        fetchUsers(pagination.current);
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
        } catch (error) {
            console.log("Validation failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async (current = 1, pageSize = null) => {
        try {
            setLoading(true);
            const response = await api.get("admin/users", {
                params: {
                    page: current,
                    limit: pageSize,
                },
            });
            if (response.data.success) {
                const usersData = response.data.pagination.data.map((user) =>
                    formatUserData(user)
                );
                setUsers(usersData);

                setPagination({
                    current: response.data.pagination.current_page,
                    pageSize: response.data.pagination.per_page,
                    total: response.data.pagination.total,
                });
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

    const handleSearch = async () => {
        try {
            const values = await searchForm.validateFields();
            setLoading(true);
            
            const response = await api.post("admin/users/search", values);
            
            if (response.data.success) {
                const usersData = response.data.pagination.data.map((user) =>
                    formatUserData(user)
                );
                setUsers(usersData);

                setPagination({
                    current: response.data.pagination.current_page,
                    pageSize: response.data.pagination.per_page,
                    total: response.data.pagination.total,
                });
            }
        } catch (error) {
            notify(
                error.response?.data?.message || "Failed to search users",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResetFilter = () => {
        searchForm.resetFields();
        fetchUsers(1);
    };

    const handleTableChange = (pagination) => {
        fetchUsers(pagination.current, pagination.pageSize);
    };

    const createUser = async (userData) => {
        try {
            const response = await api.post("admin/users", userData);
            if (response.data.success) {
                fetchUsers();
                handleCloseModal();
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
            dataIndex: "group_role",
            key: "group_role",
            render: (role) => (
                <Tag color={role === "Admin" ? "red" : "blue"}>{role}</Tag>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "is_active",
            key: "is_active",
            render: (isActive) => (
                <Tag color={isActive == 1 ? "green" : "red"}>
                    {isActive == 1 ? "Hoạt động" : "Vô hiệu hóa"}
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

    return (
        <div>
            <div className="p-6 bg-white">
                <div className="flex justify-start items-center mb-4">
                    <h2 className="text-lg font-semibold m-0">
                        Danh sách user
                    </h2>
                </div>

                {/* Search Filters */}
                <Form form={searchForm}>
                    <div className="mb-4 p-4 bg-gray-50 rounded">
                        <div className="grid grid-cols-4 gap-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium">
                                    Tên
                                </label>
                                <Form.Item name="search_name">
                                    <Input
                                        placeholder="Nhập tên..."
                                        allowClear
                                    />
                                </Form.Item>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium">
                                    Email
                                </label>
                                <Form.Item name="search_email">
                                    <Input
                                        placeholder="Nhập email..."
                                        allowClear
                                    />
                                </Form.Item>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium">
                                    Nhóm
                                </label>
                                <Form.Item name="search_group_role">
                                    <Select
                                        placeholder="Chọn nhóm"
                                        className="w-full"
                                        options={USER_ROLE_OPTIONS}
                                        allowClear
                                    />
                                </Form.Item>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium">
                                    Trạng thái
                                </label>
                                <Form.Item name="search_is_active">
                                    <Select
                                        placeholder="Chọn trạng thái"
                                        className="w-full"
                                        options={USER_STATUS_OPTIONS}
                                        allowClear
                                    />
                                </Form.Item>
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
                                    onClick={handleSearch}
                                >
                                    Tìm kiếm
                                </Button>
                                <Button
                                    icon={<CloseOutlined />}
                                    onClick={handleResetFilter}
                                >
                                    Xóa bộ lọc
                                </Button>
                            </div>
                        </div>
                    </div>
                </Form>

                <Table
                    columns={columns}
                    dataSource={users}
                    loading={loading}
                    pagination={
                        pagination.total > 20
                            ? {
                                  current: pagination.current,
                                  pageSize: pagination.pageSize,
                                  total: pagination.total,
                                  showSizeChanger: true,
                                  showTotal: (total, range) =>
                                      `Hiển thị từ ${range[0]}-${range[1]} trong ${total} dòng`,
                                  pageSizeOptions: ["10", "20", "50", "100"],
                              }
                            : {
                                  current: pagination.current,
                                  pageSize: pagination.pageSize,
                                  total: pagination.total,
                                  showTotal: (total, range) =>
                                      `Hiển thị từ ${range[0]}-${range[1]} trong ${total} dòng`,
                              }
                    }
                    onChange={handleTableChange}
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
                            options={USER_ROLE_OPTIONS}
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
