import { createPortal } from "react-dom";

function ScreenDimmer({ isShow = false, ...props }) {
  return (
    <>
      {isShow &&
        createPortal(
          <div
            className="fixed inset-0 z-[1001] bg-bg-dimmer backdrop-blur-[3px] transition-opacity duration-200 ease-out"
            {...props}
          ></div>,
          document.body
        )}
    </>
  );
}

export default ScreenDimmer;
