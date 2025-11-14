/**
 * Format product data for table display
 */
export const formatProductData = (product, index) => {
    return {
        key: product.product_id,
        id: index + 1,
        product_id: product.product_id,
        product_name: product.product_name,
        product_price: product.product_price,
        product_price_raw: product.product_price_raw,
        is_sales: product.is_sales,
        is_sales_text: product.is_sales_text,
        description: product.description,
        product_image: product.product_image,
        created_at: product.created_at,
        updated_at: product.updated_at,
    };
};

/**
 * Format price for display
 */
export const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(price);
};
