import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
    Form,
    Input,
    InputNumber,
    Select,
    Button,
    Upload,
    Image,
    Breadcrumb,
} from "antd";
import { UploadOutlined, HomeOutlined } from "@ant-design/icons";
import api from "../api/axios";
import { notify } from "../components/Toast";
import { PRODUCT_STATUS_OPTIONS } from "../constant/ProductConstant";

export default function ProductForm() {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);
    const [fileList, setFileList] = useState([]);
    const isEditMode = !!id;

    useEffect(() => {
        if (isEditMode) {
            fetchProductDetail();
        }
    }, [id]);

    const fetchProductDetail = async () => {
        try {
            setLoading(true);
            const response = await api.get(`admin/products/${id}`);
            if (response.data.success) {
                const product = response.data.data;
                form.setFieldsValue({
                    product_name: product.product_name,
                    product_price: product.product_price,
                    is_sales: product.is_sales,
                    description: product.description,
                });

                // Set image if exists
                if (product.product_image) {
                    setImageUrl(product.product_image);
                }
            }
        } catch (error) {
            notify(
                error.response?.data?.message ||
                    "Lấy thông tin sản phẩm thất bại",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (values) => {
        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("product_name", values.product_name);
            formData.append("product_price", values.product_price);
            formData.append("is_sales", values.is_sales);
            if (values.description) {
                formData.append("description", values.description);
            }

            if (fileList.length > 0) {
                formData.append("product_image", fileList[0]);
            }

            let response;
            if (isEditMode) {
                formData.append("_method", "PUT");
                response = await api.post(`admin/products/${id}`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
            } else {
                response = await api.post("admin/products", formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
            }

            if (response.data.success) {
                notify(
                    isEditMode
                        ? "Cập nhật sản phẩm thành công"
                        : "Thêm mới sản phẩm thành công",
                    "success"
                );
                navigate("/admin/products");
            }
        } catch (error) {
            notify(
                error.response?.data?.message ||
                    `${isEditMode ? "Cập nhật" : "Thêm mới"} sản phẩm thất bại`,
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate("/admin/products");
    };

    const uploadProps = {
        listType: "picture",
        showUploadList: false,
        beforeUpload: (file) => {
            const isImage = file.type.startsWith("image/");
            if (!isImage) {
                notify("Chỉ được upload file hình ảnh!", "error");
                return Upload.LIST_IGNORE;
            }

            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
                notify("Kích thước hình ảnh phải nhỏ hơn 5MB!", "error");
                return Upload.LIST_IGNORE;
            }

            // Preview image
            const reader = new FileReader();
            reader.onload = (e) => {
                setImageUrl(e.target.result);
            };
            reader.readAsDataURL(file);

            setFileList([file]);
            return false; // Prevent auto upload
        },
        onRemove: () => {
            setFileList([]);
            setImageUrl(null);
        },
    };

    return (
        <div className="p-6 bg-white">
            {/* Breadcrumb */}
            <Breadcrumb
                className="mb-4"
                items={[
                    {
                        title: (
                            <Link to="/admin/products">
                                <HomeOutlined className="mr-1" />
                                Sản phẩm
                            </Link>
                        ),
                    },
                    {
                        title: "Chi tiết sản phẩm",
                    },
                ]}
            />

            {/* Header */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold m-0">
                    {isEditMode
                        ? "Màn hình sửa sản phẩm"
                        : "Màn hình thêm sản phẩm"}
                </h2>
            </div>

            {/* Form */}
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="max-w-full"
            >
                <div className="grid grid-cols-2 gap-4">
                    {/* Left Column */}
                    <div>
                        <Form.Item
                            name="product_name"
                            label={
                                <span>
                                    Tên sản phẩm{" "}
                                    <span className="text-red-500">*</span>
                                </span>
                            }
                            rules={[
                                {
                                    required: true,
                                    message: "Tên sản phẩm không được để trống",
                                },
                                {
                                    max: 20,
                                    message:
                                        "Tên sản phẩm không được vượt quá 20 ký tự",
                                },
                            ]}
                        >
                            <Input
                                placeholder="Nhập tên sản phẩm"
                                disabled={isEditMode}
                            />
                        </Form.Item>

                        <Form.Item
                            name="product_price"
                            label={
                                <span>
                                    Giá bán{" "}
                                    <span className="text-red-500">*</span>
                                </span>
                            }
                            rules={[
                                {
                                    required: true,
                                    message: "Giá bán không được để trống",
                                },
                                {
                                    pattern: /^[0-9]+$/,
                                    message: "Giá bán không được nhỏ hơn 0",
                                },
                            ]}
                        >
                            <Input placeholder="Nhập giá bán" />
                        </Form.Item>

                        <Form.Item name="description" label="Mô tả">
                            <Input.TextArea
                                placeholder="Mô tả sản phẩm"
                                rows={6}
                            />
                        </Form.Item>
                        <Form.Item
                            name="is_sales"
                            label={
                                <span>
                                    Trạng thái{" "}
                                    <span className="text-red-500">*</span>
                                </span>
                            }
                            rules={[
                                {
                                    required: true,
                                    message: "Trạng thái không được để trống",
                                },
                            ]}
                            initialValue={1}
                        >
                            <Select
                                placeholder="Chọn trạng thái"
                                options={PRODUCT_STATUS_OPTIONS.filter(
                                    (o) => o.value !== ""
                                )}
                            />
                        </Form.Item>
                    </div>

                    {/* Right Column */}
                    <div>
                        <Form.Item
                            label="Hình ảnh"
                            className="h-full"
                            name="product_image"
                        >
                            <div
                                className="border rounded p-4 flex flex-col"
                                style={{ height: "100%", minHeight: "400px" }}
                            >
                                <div className="mb-4 flex justify-center flex-1 items-center bg-gray-100 rounded">
                                    {imageUrl ? (
                                        <Image
                                            src={imageUrl}
                                            alt="Product"
                                            style={{
                                                maxWidth: "100%",
                                                maxHeight: "100%",
                                                objectFit: "contain",
                                            }}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <svg
                                                className="w-32 h-32"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-auto">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Upload {...uploadProps}>
                                            <Button
                                                icon={<UploadOutlined />}
                                                type="primary"
                                            >
                                                Upload
                                            </Button>
                                        </Upload>
                                        <Button
                                            danger
                                            onClick={() => {
                                                setFileList([]);
                                                setImageUrl(null);
                                            }}
                                        >
                                            Xóa file
                                        </Button>
                                        <div className="text-gray-500 text-sm">
                                            {fileList.length > 0
                                                ? fileList[0].name
                                                : "Tên file upload"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Form.Item>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 mt-6">
                    <Button onClick={handleCancel}>Hủy</Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        className="bg-red-500 hover:bg-red-600"
                    >
                        Lưu
                    </Button>
                </div>
            </Form>
        </div>
    );
}
