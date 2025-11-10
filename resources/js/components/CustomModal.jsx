import React from "react";
import { Button, Modal } from "antd";

const CustomModal = ({
    open,
    title,
    children,
    onOk,
    onCancel,
    okText = "Lưu",
    cancelText = "Hủy",
    footer,
    width = 600,
    okButtonProps,
    cancelButtonProps,
}) => {
    return (
        <Modal
            title={title}
            open={open}
            onOk={onOk}
            onCancel={onCancel}
            okText={okText}
            cancelText={cancelText}
            footer={footer}
            width={width}
            okButtonProps={{
                className: "bg-red-500 hover:bg-red-600",
                ...okButtonProps,
            }}
            cancelButtonProps={{
                className: "hover:bg-gray-100",
                ...cancelButtonProps,
            }}
        >
            {children}
        </Modal>
    );
};

export default CustomModal;
