import { forwardRef } from "react";
import classNames from "classnames";

const Container = forwardRef(({ children, className, ...passProps }, ref) => {
  const containerStyles = classNames("bg-bg-sidebar rounded-[4px]", {
    [className]: className,
  });

  const handleClickInside = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      ref={ref}
      onClick={handleClickInside}
      className={containerStyles}
      {...passProps}
    >
      {children}
    </div>
  );
});

export default Container;
