import classNames from "classnames";

function FlexContainer({
  children,
  className,
  isReverseRow = false,
  isReverseCol = false,
  isWrap = false,
  ...props
}) {
  const flexContainerStyles = classNames("flex gap-y-[40px]", {
    [className]: classNames,
    "flex-wrap": isWrap,
    "flex-row-reverse": isReverseRow,
    "flex-col-reverse": isReverseCol,
  });

  return (
    <div className={flexContainerStyles} {...props}>
      {children}
    </div>
  );
}

export default FlexContainer;
