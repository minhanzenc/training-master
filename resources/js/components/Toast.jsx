import { toast } from "react-toastify";

export const notify = (message, type = "info") => {
    const options = {
        position: "top-right",
        autoClose: 3000,
    };

    if (type === "success") {
        toast.success(message, options);
    } else if (type === "error") {
        toast.error(message, options);
    } else {
        toast(message, options);
    }
};
