import { createPortal } from "react-dom";

function ScreenDimmer({ isShow = false, ...props }) {
  return (
    <>
      {isShow &&
        createPortal(
          <div className="fixed inset-0 bg-bg-dimmer z-[1001]" {...props}></div>,
          document.body
        )}
    </>
  );
}

export default ScreenDimmer;
