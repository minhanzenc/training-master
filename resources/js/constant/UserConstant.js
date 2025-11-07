export const USER_STATUS = {
    ACTIVE: 1,
    INACTIVE: 0,
};
export const USER_ROLES = {
    ADMIN: "admin",
    MANAGER: "manager",
    REVIEWER: "reviewer",
};

export const USER_ROLE_OPTIONS = [
    { value: "admin", label: "Admin" },
    { value: "manager", label: "Manager" },
    { value: "reviewer", label: "Reviewer" },
];

export const USER_STATUS_OPTIONS = [
    { value: 1, label: "Đang hoạt động" },
    { value: 0, label: "Tạm khóa" },
];
