import {
    Button,
    Table,
    Tag,
    Input,
    Select,
    Space,
    Form,
    InputNumber,
    Breadcrumb,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    CloseOutlined,
    HomeOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomModal from "../components/CustomModal";
import api from "../api/axios";
import { notify } from "../components/Toast";
import { formatProductData } from "../utils/ProductUtils";
import {
    PRODUCT_STATUS_OPTIONS,
    PRODUCT_STATUS_MAP,
} from "../constant/ProductConstant";

export default function Products() {
    const navigate = useNavigate();
    const [searchForm] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [editingKey, setEditingKey] = useState("");
    const [editForm] = Form.useForm();

    useEffect(() => {
        fetchProducts(pagination.current);
    }, []);

    const handleNavigateToCreate = () => {
        navigate("/admin/products/create");
    };

    const handleNavigateToEdit = (product) => {
        navigate(`/admin/products/${product.key}/edit`);
    };

    const handleOpenDeleteModal = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const isEditing = (record) => record.key === editingKey;

    const handleEdit = (record) => {
        editForm.setFieldsValue({
            product_name: record.product_name,
            product_price: record.product_price_raw,
            is_sales: record.is_sales,
            description: record.description,
        });
        setEditingKey(record.key);
    };

    const handleCancelEdit = () => {
        setEditingKey("");
    };

    const handleSaveEdit = async (key) => {
        try {
            const row = await editForm.validateFields();
            await updateProduct(key, row);
            setEditingKey("");
        } catch (error) {
            console.log("Validate Failed:", error);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    const handleConfirmDelete = async () => {
        try {
            setLoading(true);
            await deleteProduct(selectedProduct.key);
        } catch (error) {
            console.log("Delete failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async (current = 1, pageSize = null) => {
        try {
            setLoading(true);
            const response = await api.get("admin/products", {
                params: {
                    page: current,
                    limit: pageSize,
                },
            });
            if (response.data.success) {
                const productsData = response.data.pagination.data.map(
                    (product, index) => formatProductData(product, index)
                );
                setProducts(productsData);

                setPagination({
                    current: response.data.pagination.current_page,
                    pageSize: response.data.pagination.per_page,
                    total: response.data.pagination.total,
                });
            }
        } catch (error) {
            notify(
                error.response?.data?.message ||
                    "Lấy danh sách sản phẩm thất bại",
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

            const response = await api.post("admin/products/search", values);

            if (response.data.success) {
                const productsData = response.data.pagination.data.map(
                    (product, index) => formatProductData(product, index)
                );
                setProducts(productsData);

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
        fetchProducts();
    };

    const handleTableChange = (pagination) => {
        fetchProducts(pagination.current, pagination.pageSize);
    };

    const updateProduct = async (id, productData) => {
        try {
            setLoading(true);
            const response = await api.put(`admin/products/${id}`, productData);
            if (response.data.success) {
                fetchProducts(pagination.current, pagination.pageSize);
                notify("Cập nhật sản phẩm thành công", "success");
            }
        } catch (error) {
            notify(
                error.response?.data?.message || "Cập nhật sản phẩm thất bại",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    const deleteProduct = async (id) => {
        try {
            const response = await api.delete(`admin/products/${id}`);
            if (response.data.success) {
                fetchProducts();
                handleCloseModal();
                notify("Xóa sản phẩm thành công", "success");
            }
        } catch (error) {
            notify(
                error.response?.data?.message || "Xóa sản phẩm thất bại",
                "error"
            );
        }
    };

    const handleExportCsv = async () => {
        try {
            setLoading(true);
            const values = searchForm.getFieldsValue();
            const response = await api.get(`admin/products/export`, {
                responseType: "blob",
                params: {
                    search_product_id: values.search_product_id,
                    search_product_name: values.search_product_name,
                    search_price_from: values.search_price_from,
                    search_price_to: values.search_price_to,
                    search_is_sales: values.search_is_sales,
                },
            });

            const contentDisposition = response.headers["content-disposition"];
            let filename = "products_export.csv";
            if (contentDisposition) {
                const filenameMatch =
                    contentDisposition.match(/filename="?(.+)"?/i);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            notify("Xuất danh sách sản phẩm thành công", "success");
        } catch (error) {
            notify(
                error.response?.data?.message ||
                    "Xuất danh sách sản phẩm thất bại",
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
            width: "5%",
        },
        {
            title: "Tên sản phẩm",
            dataIndex: "product_name",
            key: "product_name",
            width: "25%",
            editable: true,
            render: (text, record) => {
                if (isEditing(record)) {
                    return (
                        <Form.Item
                            name="product_name"
                            style={{ margin: 0 }}
                            rules={[
                                {
                                    required: true,
                                    message: "Tên sản phẩm không được để trống",
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
            title: "Mô tả",
            dataIndex: "description",
            key: "description",
            width: "30%",
            editable: true,
            render: (text, record) => {
                if (isEditing(record)) {
                    return (
                        <Form.Item name="description" style={{ margin: 0 }}>
                            <Input.TextArea rows={2} />
                        </Form.Item>
                    );
                }
                return text;
            },
        },
        {
            title: "Giá",
            dataIndex: "product_price",
            key: "product_price",
            width: "15%",
            editable: true,
            render: (text, record) => {
                if (isEditing(record)) {
                    return (
                        <Form.Item
                            name="product_price"
                            style={{ margin: 0 }}
                            rules={[
                                {
                                    required: true,
                                    message: "Giá không được để trống",
                                },
                            ]}
                        >
                            <InputNumber
                                min={0}
                                style={{ width: "100%" }}
                                formatter={(value) =>
                                    `${value}`.replace(
                                        /\B(?=(\d{3})+(?!\d))/g,
                                        ","
                                    )
                                }
                                parser={(value) =>
                                    value.replace(/\$\s?|(,*)/g, "")
                                }
                            />
                        </Form.Item>
                    );
                }
                return text;
            },
        },
        {
            title: "Tình trạng",
            dataIndex: "is_sales",
            key: "is_sales",
            width: "12%",
            editable: true,
            render: (status, record) => {
                if (isEditing(record)) {
                    return (
                        <Form.Item
                            name="is_sales"
                            style={{ margin: 0 }}
                            rules={[
                                {
                                    required: true,
                                    message: "Tình trạng không được để trống",
                                },
                            ]}
                        >
                            <Select
                                options={PRODUCT_STATUS_OPTIONS.filter(
                                    (o) => o.value !== ""
                                )}
                            />
                        </Form.Item>
                    );
                }
                const statusInfo = PRODUCT_STATUS_MAP[status];
                return <Tag color={statusInfo?.color}>{statusInfo?.text}</Tag>;
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
                    <Space>
                        <Button
                            type="link"
                            icon={<EditOutlined />}
                            className="text-blue-500"
                            disabled={editingKey !== ""}
                            onClick={() => handleNavigateToEdit(record)}
                        />
                        <Button
                            type="link"
                            icon={<DeleteOutlined />}
                            className="text-red-500"
                            disabled={editingKey !== ""}
                            onClick={() => handleOpenDeleteModal(record)}
                        />
                    </Space>
                );
            },
        },
    ];

    return (
        <div>
            <div className="p-6 bg-white">
                {/* Breadcrumb */}
                <Breadcrumb
                    className="mb-4"
                    items={[
                        {
                            title: (
                                <span>
                                    <HomeOutlined className="mr-1" />
                                    Sản phẩm
                                </span>
                            ),
                        },
                    ]}
                />

                <div className="flex justify-start items-center mb-4">
                    <h2 className="text-lg font-semibold m-0">
                        Danh sách sản phẩm
                    </h2>
                </div>

                {/* Search Filters */}
                <Form form={searchForm}>
                    <div className="mb-4 p-4 bg-gray-50 rounded">
                        <div className="grid grid-cols-4 gap-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium">
                                    Tên sản phẩm
                                </label>
                                <Form.Item name="search_product_name">
                                    <Input
                                        placeholder="Nhập tên sản phẩm"
                                        allowClear
                                    />
                                </Form.Item>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium">
                                    Giá bán từ
                                </label>
                                <Form.Item name="search_price_from">
                                    <InputNumber
                                        placeholder="0"
                                        min={0}
                                        style={{ width: "100%" }}
                                        formatter={(value) =>
                                            `${value}`.replace(
                                                /\B(?=(\d{3})+(?!\d))/g,
                                                ","
                                            )
                                        }
                                        parser={(value) =>
                                            value.replace(/\$\s?|(,*)/g, "")
                                        }
                                    />
                                </Form.Item>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium">
                                    Giá bán đến
                                </label>
                                <Form.Item name="search_price_to">
                                    <InputNumber
                                        placeholder="0"
                                        min={0}
                                        style={{ width: "100%" }}
                                        formatter={(value) =>
                                            `${value}`.replace(
                                                /\B(?=(\d{3})+(?!\d))/g,
                                                ","
                                            )
                                        }
                                        parser={(value) =>
                                            value.replace(/\$\s?|(,*)/g, "")
                                        }
                                    />
                                </Form.Item>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium">
                                    Trạng thái
                                </label>
                                <Form.Item name="search_is_sales">
                                    <Select
                                        placeholder="Chọn trạng thái"
                                        className="w-full"
                                        options={PRODUCT_STATUS_OPTIONS}
                                        allowClear
                                    />
                                </Form.Item>
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <div className="mt-4 flex gap-2">
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    className="bg-blue-500 hover:bg-blue-600"
                                    onClick={handleNavigateToCreate}
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

                <Form form={editForm} component={false}>
                    <Table
                        columns={columns}
                        dataSource={products}
                        loading={loading}
                        pagination={
                            pagination.total > 20
                                ? {
                                      current: pagination.current,
                                      pageSize: pagination.pageSize,
                                      total: pagination.total,
                                      showSizeChanger: true,
                                      showTotal: (total, range) =>
                                          `Hiển thị từ ${range[0]}-${range[1]} trong tổng số ${total} sản phẩm`,
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
                                          `Hiển thị từ ${range[0]}-${range[1]} trong tổng số ${total} sản phẩm`,
                                  }
                        }
                        onChange={handleTableChange}
                        bordered
                    />
                </Form>
            </div>

            <CustomModal
                open={isModalOpen}
                title="Xác nhận xóa"
                onOk={handleConfirmDelete}
                onCancel={handleCloseModal}
                okButtonProps={{ loading }}
                >
                    <p>
                    Bạn có muốn xóa sản phẩm "{selectedProduct?.product_name}"
                    không?
                </p>
            </CustomModal>
        </div>
    );
}
