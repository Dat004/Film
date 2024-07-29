import classNames from "classnames";

function FlexItems({ children, className }) {
  const flexItemsStyles = classNames("relative flex-grow-1 flex-shrink-0", {
    [className]: className,
  });

  return <div className={flexItemsStyles}>{children}</div>;
}

export default FlexItems;
