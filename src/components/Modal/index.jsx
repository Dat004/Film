import { createPortal } from "react-dom";

function Modal({ children, onClose = () => {}, isShowModal = false }) {
  const handleClickOutside = (e) => {
    e.stopPropagation();

    onClose();
  };

  const variants = {
    hide: {
      y: "-10%",
      opacity: 0,
    },
    show: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <>
      {isShowModal &&
        createPortal(
          <div
            onClick={handleClickOutside}
            className="fixed inset-0 z-[1000]"
          >
            <div className="relative z-[90] flex items-center justify-center w-[100%] h-full">
              <div className="relative w-[100%] z-[10]">{children}</div>
              <div className="absolute inset-0 opacity-80 bg-bg-layout z-5"></div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

export default Modal;