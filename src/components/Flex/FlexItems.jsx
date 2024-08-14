import classNames from "classnames";

function FlexItems({ children, className, ...props }) {
  const flexItemsStyles = classNames("relative flex-grow-1 flex-shrink-0", {
    [className]: className,
  });

  return <div className={flexItemsStyles} {...props}>{children}</div>;
}

export default FlexItems;
