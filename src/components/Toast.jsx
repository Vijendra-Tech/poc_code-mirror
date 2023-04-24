import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function toastMessage( message, isSuccess=true) {
  const tOptions = {
    position: "top-right",
    autoClose: 1000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  };
  if (isSuccess) {
    toast.success(message || "compiled successfully", tOptions);
  } else {
    toast.error(message || "Something went wrong !!", tOptions);
  }
}
