// Product Status Options
export const PRODUCT_STATUS_OPTIONS = [
    { label: "Tất cả", value: "" },
    { label: "Đang bán", value: 1 },
    { label: "Dừng bán", value: 0 },
    { label: "Hết hàng", value: 2 },
];

// Product Status Map
export const PRODUCT_STATUS_MAP = {
    0: { text: "Dừng bán", color: "red" },
    1: { text: "Đang bán", color: "green" },
    2: { text: "Hết hàng", color: "orange" },
};
