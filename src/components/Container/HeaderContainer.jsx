import classNames from "classnames";

import Button from "../Button";

function HeaderContainer({
  className,
  title = "",
  to = "",
  isShowAll = false,
}) {
  const headerStyles = classNames("flex items-center mb-[16px]", {
    [className]: className,
  });

  return (
    <div className={headerStyles}>
      <h3 className="text-[24px] text-primary font-semibold">{title}</h3>
      {isShowAll && (
        <div className="ml-auto">
          <Button className="text-[14px]" to={to}>
            Xem tất cả
          </Button>
        </div>
      )}
    </div>
  );
}

export default HeaderContainer;
