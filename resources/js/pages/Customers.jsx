import {
    Button,
    Table,
    Tag,
    Input,
    Select,
    Space,
    Form,
    Switch,
    Upload,
} from "antd";
import {
    UserAddOutlined,
    EditOutlined,
    SearchOutlined,
    CloseOutlined,
    ImportOutlined,
    ExportOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import CustomModal from "../components/CustomModal";
import api from "../api/axios";
import { notify } from "../components/Toast";
import { formatCustomerData } from "../utils/CustomerUtils";
import { CUSTOMER_STATUS_OPTIONS } from "../constant/CustomerConstant";
import axios from "axios";

export default function Customers() {
    const [form] = Form.useForm();
    const [searchForm] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("create");
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [editingKey, setEditingKey] = useState("");
    const [editForm] = Form.useForm();

    const uploadProps = {
        name: "file",
        showUploadList: true,
        maxCount: 1,
        beforeUpload: async (file) => {
            const fileName = file.name.toLowerCase();
            if (!fileName.endsWith(".csv") || file.type !== "text/csv") {
                notify("Hãy chọn file CSV", "error");
                return Upload.LIST_IGNORE;
            }

            return new Promise((resolve, reject) => {
                const reader = new FileReader();

                reader.onload = (e) => {
                    const text = e.target.result;

                    if (text.includes("\0")) {
                        notify(
                            "File không đúng định dạng CSV! Vui lòng kiểm tra lại.",
                            "error"
                        );
                        reject();
                        return;
                    }

                    const lines = text
                        .split("\n")
                        .filter((line) => line.trim());
                    if (lines.length === 0) {
                        notify("File CSV rỗng!", "error");
                        reject();
                        return;
                    }

                    resolve(true);
                };

                reader.onerror = () => {
                    notify("Không thể đọc file!", "error");
                    reject();
                };

                reader.readAsText(file.slice(0, 102400), "UTF-8");
            });
        },
        customRequest: async ({ file, onSuccess, onError, onProgress }) => {
            const formData = new FormData();
            formData.append("file", file);

            let currentProgress = 0;
            const progressInterval = setInterval(() => {
                currentProgress += Math.random() * 10 + 5;
                if (currentProgress >= 90) {
                    currentProgress = 90;
                    clearInterval(progressInterval);
                }
                onProgress({ percent: Math.round(currentProgress) });
            }, 500);

            try {
                setLoading(true);
                const response = await api.post(
                    "admin/customers/import",
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );

                clearInterval(progressInterval);
                onProgress({ percent: 100 });

                if (response.data.success) {
                    onSuccess(response.data, file);
                    notify(
                        response.data.message ||
                            `${file.name} được tải lên thành công`,
                        "success"
                    );
                    fetchCustomers();
                }
            } catch (error) {
                clearInterval(progressInterval);
                onError(error);

                const errorData = error.response?.data;
                console.log("Error Data:", errorData);
                if (errorData?.errorFilename) {
                    const handleDownloadError = async () => {
                        try {
                            const response = await api.get(
                                `admin/customers/download-error/${errorData.errorFilename}`,
                                {
                                    responseType: "blob",
                                }
                            );

                            const url = window.URL.createObjectURL(
                                new Blob([response.data])
                            );
                            const link = document.createElement("a");
                            link.href = url;
                            link.setAttribute(
                                "download",
                                errorData.errorFilename
                            );
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                            window.URL.revokeObjectURL(url);
                        } catch (err) {
                            notify("Không thể tải file lỗi", "error");
                        }
                    };

                    notify(
                        <div>
                            <div>{errorData.message}</div>
                            <a
                                onClick={handleDownloadError}
                                style={{
                                    color: "#1890ff",
                                    textDecoration: "underline",
                                    cursor: "pointer",
                                }}
                            >
                                Tải file lỗi xuống
                            </a>
                        </div>,
                        "error",
                        10000
                    );
                } else {
                    notify(
                        errorData?.message || `${file.name} tải lên thất bại`,
                        "error"
                    );
                }
            } finally {
                setLoading(false);
            }
        },
    };

    useEffect(() => {
        fetchCustomers(pagination.current);
    }, []);

    const handleOpenModal = (mode, customer = null) => {
        setModalMode(mode);
        setSelectedCustomer(customer);
        setIsModalOpen(true);

        if (mode === "create") {
            form.resetFields();
        }
    };

    const isEditing = (record) => record.key === editingKey;

    const handleEdit = (record) => {
        editForm.setFieldsValue({
            customer_name: record.customer_name,
            email: record.email,
            tel_num: record.tel_num,
            address: record.address,
        });
        setEditingKey(record.key);
    };

    const handleCancelEdit = () => {
        setEditingKey("");
    };

    const handleSaveEdit = async (key) => {
        try {
            const row = await editForm.validateFields();
            await updateCustomer(key, row);
            setEditingKey("");
        } catch (error) {
            console.log("Validate Failed:", error);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCustomer(null);
        form.resetFields();
    };

    const getModalConfig = () => {
        const configs = {
            create: {
                title: "Thêm Khách hàng",
                showForm: true,
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
                create: () => createCustomer(values),
                edit: () => updateCustomer(selectedCustomer.key, values),
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

    const fetchCustomers = async (current = 1, pageSize = null) => {
        try {
            setLoading(true);
            const response = await api.get("admin/customers", {
                params: {
                    page: current,
                    limit: pageSize,
                },
            });
            if (response.data.success) {
                const customersData = response.data.pagination.data.map(
                    (customer, index) => formatCustomerData(customer, index)
                );
                setCustomers(customersData);

                setPagination({
                    current: response.data.pagination.current_page,
                    pageSize: response.data.pagination.per_page,
                    total: response.data.pagination.total,
                });
            }
        } catch (error) {
            notify(
                error.response?.data?.message ||
                    "Lấy danh sách khách hàng thất bại",
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

            const response = await api.post("admin/customers/search", values);

            if (response.data.success) {
                const customersData = response.data.pagination.data.map(
                    (customer, index) => formatCustomerData(customer, index)
                );
                setCustomers(customersData);

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
        fetchCustomers();
    };

    const handleTableChange = (pagination) => {
        fetchCustomers(pagination.current, pagination.pageSize);
    };

    const createCustomer = async (customerData) => {
        try {
            const response = await api.post("admin/customers", customerData);
            if (response.data.success) {
                fetchCustomers();
                handleCloseModal();
                notify("Thêm mới khách hàng thành công", "success");
            }
        } catch (error) {
            notify(
                error.response?.data?.message || "Thêm mới khách hàng thất bại",
                "error"
            );
        }
    };

    const updateCustomer = async (id, customerData) => {
        try {
            setLoading(true);
            const response = await api.put(
                `admin/customers/${id}`,
                customerData
            );
            if (response.data.success) {
                fetchCustomers(pagination.current, pagination.pageSize);
                notify("Cập nhật khách hàng thành công", "success");
            }
        } catch (error) {
            notify(
                error.response?.data?.message || "Cập nhật khách hàng thất bại",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: "#",
            dataIndex: "id",
            key: "id",
            width: "7%",
        },
        {
            title: "Họ tên",
            dataIndex: "customer_name",
            key: "customer_name",
            width: "20%",
            editable: true,
            render: (text, record) => {
                if (isEditing(record)) {
                    return (
                        <Form.Item
                            name="customer_name"
                            style={{ margin: 0 }}
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
                            <Input />
                        </Form.Item>
                    );
                }
                return text;
            },
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            width: "20%",
            editable: true,
            render: (text, record) => {
                if (isEditing(record)) {
                    return (
                        <Form.Item
                            name="email"
                            style={{ margin: 0 }}
                            rules={[
                                {
                                    required: true,
                                    message: "Email không được để trống",
                                },
                                {
                                    type: "email",
                                    message: "Email không đúng định dạng",
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                    );
                }
                return text;
            },
        },
        {
            title: "Địa chỉ",
            dataIndex: "address",
            key: "address",
            width: "20%",
            editable: true,
            render: (text, record) => {
                if (isEditing(record)) {
                    return (
                        <Form.Item
                            name="address"
                            style={{ margin: 0 }}
                            rules={[
                                {
                                    required: true,
                                    message: "Địa chỉ không được để trống",
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                    );
                }
                return text;
            },
        },
        {
            title: "Điện thoại",
            dataIndex: "tel_num",
            key: "tel_num",
            width: "20%",
            editable: true,
            render: (text, record) => {
                if (isEditing(record)) {
                    return (
                        <Form.Item
                            name="tel_num"
                            style={{ margin: 0 }}
                            rules={[
                                {
                                    required: true,
                                    message:
                                        "Số điện thoại không được để trống",
                                },
                                {
                                    pattern: /^[0-9]{10,11}$/,
                                    message:
                                        "Số điện thoại phải có 10-11 chữ số",
                                },
                            ]}
                        >
                            <Input />
                        </Form.Item>
                    );
                }
                return text;
            },
        },
        {
            title: "",
            key: "action",
            width: "13%",
            align: "center",

            render: (_, record) => {
                const editable = isEditing(record);
                return editable ? (
                    <Space>
                        <Button
                            type="link"
                            onClick={() => handleSaveEdit(record.key)}
                            style={{ marginRight: 8 }}
                        >
                            Lưu
                        </Button>
                        <Button type="link" onClick={handleCancelEdit}>
                            Hủy
                        </Button>
                    </Space>
                ) : (
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        className="text-blue-500"
                        disabled={editingKey !== ""}
                        onClick={() => handleEdit(record)}
                    />
                );
            },
        },
    ];

    return (
        <div>
            <div className="p-6 bg-white">
                <div className="flex justify-start items-center mb-4">
                    <h2 className="text-lg font-semibold m-0">
                        Danh sách khách hàng
                    </h2>
                </div>

                {/* Search Filters */}
                <Form form={searchForm}>
                    <div className="mb-4 p-4 bg-gray-50 rounded">
                        <div className="grid grid-cols-4 gap-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium">
                                    Họ và Tên
                                </label>
                                <Form.Item name="search_name">
                                    <Input
                                        placeholder="Nhập họ tên"
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
                                        placeholder="Nhập email"
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
                                        options={CUSTOMER_STATUS_OPTIONS}
                                        allowClear
                                    />
                                </Form.Item>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium">
                                    Địa chỉ
                                </label>
                                <Form.Item name="search_address">
                                    <Input
                                        placeholder="Nhập địa chỉ"
                                        allowClear
                                    />
                                </Form.Item>
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <div className="mt-4 flex gap-2">
                                <Button
                                    type="primary"
                                    icon={<UserAddOutlined />}
                                    className="bg-blue-500 hover:bg-blue-600"
                                    onClick={() => handleOpenModal("create")}
                                >
                                    Thêm mới
                                </Button>
                                <Upload {...uploadProps}>
                                    <Button
                                        icon={<ImportOutlined />}
                                        color="green"
                                        variant="solid"
                                    >
                                        Import CSV
                                    </Button>
                                </Upload>
                                <Button
                                    icon={<ExportOutlined />}
                                    color="green"
                                    variant="solid"
                                >
                                    Export CSV
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

                <Form form={editForm} component={false}>
                    <Table
                        columns={columns}
                        dataSource={customers}
                        loading={loading}
                        pagination={
                            pagination.total > 20
                                ? {
                                      current: pagination.current,
                                      pageSize: pagination.pageSize,
                                      total: pagination.total,
                                      showSizeChanger: true,
                                      showTotal: (total, range) =>
                                          `Hiển thị từ ${range[0]}-${range[1]} trong tổng số ${total} khách hàng`,
                                      pageSizeOptions: [
                                          "10",
                                          "20",
                                          "50",
                                          "100",
                                      ],
                                  }
                                : {
                                      current: pagination.current,
                                      pageSize: pagination.pageSize,
                                      total: pagination.total,
                                      showTotal: (total, range) =>
                                          `Hiển thị từ ${range[0]}-${range[1]} trong tổng số ${total} khách hàng`,
                                  }
                        }
                        onChange={handleTableChange}
                        bordered
                    />
                </Form>
            </div>

            <CustomModal
                open={isModalOpen}
                title={getModalConfig().title}
                onOk={handleSubmit}
                onCancel={handleCloseModal}
                confirmLoading={loading}
            >
                {getModalConfig().showForm ? (
                    <Form form={form} layout="vertical">
                        <Form.Item
                            name="customer_name"
                            label={
                                <span>
                                    Họ và Tên{" "}
                                    <span className="text-red-500">*</span>
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

                        <Form.Item
                            name="email"
                            label={
                                <span>
                                    Email{" "}
                                    <span className="text-red-500">*</span>
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
                            ]}
                        >
                            <Input
                                placeholder="Nhập email"
                                disabled={modalMode === "edit"}
                            />
                        </Form.Item>

                        <Form.Item
                            name="tel_num"
                            label={
                                <span>
                                    Số điện thoại{" "}
                                    <span className="text-red-500">*</span>
                                </span>
                            }
                            rules={[
                                {
                                    pattern: /^[0-9]{10,11}$/,
                                    message:
                                        "Số điện thoại phải có 10-11 chữ số",
                                },
                                {
                                    required: true,
                                    message:
                                        "Số điện thoại không được để trống",
                                },
                            ]}
                        >
                            <Input placeholder="Nhập số điện thoại" />
                        </Form.Item>

                        <Form.Item
                            name="address"
                            label={
                                <span>
                                    Địa chỉ{" "}
                                    <span className="text-red-500">*</span>
                                </span>
                            }
                            rules={[
                                {
                                    required: true,
                                    message: "Địa chỉ không được để trống",
                                },
                            ]}
                        >
                            <Input.TextArea
                                placeholder="Nhập địa chỉ"
                                rows={3}
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
