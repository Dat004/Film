import { createPortal } from "react-dom";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function CustomToastContainer({ ...props }) {
  const defaultProps = {
    hideProgressBar: false,
    position: "top-right",
    transition: Bounce,
    closeOnClick: true,
    pauseOnHover: true,
    newestOnTop: true,
    autoClose: 3500,
    draggable: true,
    limit: 5,
    ...props,
  };

  return (
    <>
      {createPortal(
        <ToastContainer {...defaultProps}></ToastContainer>,
        document.body
      )}
    </>
  );
}

export const ToastMessage = {
  success: (message, options = {}) => {
    toast.success(message, options);
  },
  error: (message, options = {}) => {
    toast.error(message, options);
  },
  info: (message, options = {}) => {
    toast.info(message, options);
  },
  warning: (message, options = {}) => {
    toast.warning(message, options);
  },
};
