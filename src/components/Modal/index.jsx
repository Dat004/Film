import { createPortal } from "react-dom";

function Modal({ children, onClose = () => {} }) {
  return (
    <>
      {createPortal(
        <div
          role="presentation"
          className="fixed inset-0 z-[1000] flex items-center justify-center p-[15px] bg-[var(--modal-backdrop)]"
          onClick={onClose}
        >
          <div onClick={(e) => e.stopPropagation()}>{children}</div>
        </div>,
        document.body
      )}
    </>
  );
}

export default Modal;
