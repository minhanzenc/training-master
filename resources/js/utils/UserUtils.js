function capitalizeAllWords(str) {
    return str
        .split(" ")
        .map((word) => {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(" ");
}

export const formatUserData = (userData, index) => {
    return {
        key: userData.user_id.toString(),
        id: userData.user_id,
        name: userData.name,
        email: userData.email,
        group_role: capitalizeAllWords(userData.group_role),
        is_active: userData.is_active,
    };
};
