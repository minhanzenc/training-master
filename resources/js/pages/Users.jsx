import { Button, Table, Tag, Input, Select, Space, Form, Switch } from "antd";
import {
    UserAddOutlined,
    EditOutlined,
    DeleteOutlined,
    LockOutlined,
    UnlockOutlined,
    SearchOutlined,
    CloseOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import CustomModal from "../components/CustomModal";
import api from "../api/axios";
import { notify } from "../components/Toast";
import { formatUserData } from "../utils/UserUtils";
import {
    USER_STATUS_OPTIONS,
    USER_ROLE_OPTIONS,
} from "../constant/UserConstant";

export default function Users() {
    const [form] = Form.useForm();
    const [searchForm] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create");
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

    const getModalConfig = () => {
        const configs = {
            create: {
                title: "Thêm User",
                showForm: true,
            },
            edit: {
                title: "Chỉnh sửa User",
                showForm: true,
            },
            delete: {
                title: "Xác nhận xóa",
                showForm: false,
                content: `Bạn có muốn xóa thành viên ${
                    selectedUser?.name || ""
                } không?`,
            },
            lock: {
                title: "Xác nhận thay đổi trạng thái",
                showForm: false,
                content: `Bạn có muốn ${
                    selectedUser?.is_active == 1 ? "khóa" : "mở khóa"
                } thành viên ${selectedUser?.name || ""} không?`,
            },
        };

        return configs[modalMode] || configs.create;
    };

    const handleSubmit = async () => {
        try {
            const modalConfig = getModalConfig();

            const values = modalConfig.showForm
                ? await form.validateFields()
                : {};
            setLoading(true);

            const actions = {
                create: () => createUser(values),
                edit: () => updateUser(selectedUser.key, values),
                delete: () => deleteUser(selectedUser.key),
                lock: () => lockUser(selectedUser.key),
            };

            const action = actions[modalMode];

            if (action) {
                await action();
            } else {
                console.warn("Unknown modal mode:", modalMode);
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
                const usersData = response.data.pagination.data.map(
                    (user, index) => formatUserData(user, index)
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
                error.response?.data?.message || "Lấy danh sách người dùng thất bại",
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
                const usersData = response.data.pagination.data.map((user,index) =>
                    formatUserData(user,index)
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
                error.response?.data?.message || "Tìm kiếm thất bại",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResetFilter = () => {
        searchForm.resetFields();
        fetchUsers();
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
                notify("Thêm mới người dùng thành công", "success");
            }
        } catch (error) {
            notify(
                error.response?.data?.message || "Thêm mới người dùng thất bại",
                "error"
            );
        }
    };

    const updateUser = async (id, userData) => {
        try {
            const response = await api.put(`admin/users/${id}`, userData);
            if (response.data.success) {
                fetchUsers();
                handleCloseModal();
                notify("Cập nhật người dùng thành công", "success");
            }
        } catch (error) {
            notify(
                error.response?.data?.message || "Cập nhật người dùng thất bại",
                "error"
            );
        }
    };

    const deleteUser = async (id) => {
        try {
            const response = await api.delete(`admin/users/${id}`);
            if (response.data.success) {
                fetchUsers();
                handleCloseModal();
                notify("Xóa người dùng thành công", "success");
            }
        } catch (error) {
            notify(
                error.response?.data?.message || "Xóa người dùng thất bại",
                "error"
            );
        }
    };

    const lockUser = async (id) => {
        try {
            const response = await api.post(`admin/users/${id}/lock`);
            if (response.data.success) {
                fetchUsers();
                handleCloseModal();
                notify("Thay đổi trạng thái khóa người dùng thành công", "success");
            }
        } catch (error) {
            notify(
                error.response?.data?.message || "Thay đổi trạng thái khóa người dùng thất bại",
                "error"
            );
        }
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
            title: "",
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
                        icon={
                            record.is_active == 1 ? (
                                <LockOutlined />
                            ) : (
                                <UnlockOutlined />
                            )
                        }
                        className="text-green-500"
                        onClick={() => handleOpenModal("lock", record)}
                    />
                    <Button
                        type="link"
                        icon={<DeleteOutlined />}
                        className="text-red-500"
                        onClick={() => handleOpenModal("delete", record)}
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
                title={getModalConfig().title}
                onOk={handleSubmit}
                okText={modalMode === "delete" || modalMode === "lock" ? "OK" : "Lưu"}
                onCancel={handleCloseModal}
                confirmLoading={loading}
            >
                {getModalConfig().showForm ? (
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
                                    message:
                                        "Họ và tên phải có ít nhất 5 ký tự",
                                },
                            ]}
                        >
                            <Input placeholder="Nhập họ tên" />
                        </Form.Item>

                        {modalMode === "create" && (
                            <>
                                <Form.Item
                                    name="email"
                                    label={
                                        <span>
                                            Email{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </span>
                                    }
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                "Email không được để trống",
                                        },
                                        {
                                            type: "email",
                                            message:
                                                "Email không đúng định dạng",
                                        },
                                        {
                                            unique: true,
                                            message: "Email đã tồn tại",
                                        },
                                    ]}
                                >
                                    <Input placeholder="Nhập email" />
                                </Form.Item>
                            </>
                        )}
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
                                    message: "Mật khẩu phải có ít nhất 5 ký tự",
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
                                            getFieldValue("password") === value
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
                        <Form.Item
                            name="group_role"
                            label={
                                <span>
                                    Nhóm <span className="text-red-500">*</span>
                                </span>
                            }
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng chọn nhóm",
                                },
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
                            initialValue={0}
                            getValueFromEvent={(checked) => (checked ? 1 : 0)}
                        >
                            <Switch />
                        </Form.Item>
                    </Form>
                ) : (
                    <p>{getModalConfig().content}</p>
                )}
            </CustomModal>
        </div>
    );
}
