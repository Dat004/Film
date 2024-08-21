import { forwardRef } from "react";
import classNames from "classnames";

const Container = forwardRef(({ children, className, ...passProps }, ref) => {
  const containerStyles = classNames("bg-bg-sidebar rounded-[4px]", {
    [className]: className,
  });

  const handleClick = (e) => {
    e.preventDefault();
  };

  return (
    <div onClick={handleClick} ref={ref} className={containerStyles} {...passProps}>
      {children}
    </div>
  );
});

export default Container;
