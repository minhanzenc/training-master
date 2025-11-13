export const formatCustomerData = (customer, index) => {
    return {
        id: index + 1,
        key: customer.customer_id.toString(),
        customer_name: customer.customer_name,
        email: customer.email,
        tel_num: customer.tel_num || "N/A",
        address: customer.address || "N/A",
        is_active: customer.is_active,
    };
};
