import classNames from "classnames";

function Container({ children, className, ...passProps }) {
  const containerStyles = classNames("bg-bg-sidebar rounded-[4px]", {
    [className]: className,
  });

  const handleClick = (e) => {
    e.stopPropagation();
  };

  return <div onClick={handleClick} className={containerStyles} {...passProps}>{children}</div>;
}

export default Container;
