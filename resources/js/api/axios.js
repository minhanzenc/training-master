import axios from "axios";

const api = axios.create({
    baseURL: "/api/v1",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
    },
});

export const getCsrfToken = () => {
    return axios.get("/sanctum/csrf-cookie", {
        withCredentials: true,
    });
};

export default api;
