import { Link } from "react-router-dom";
import classNames from "classnames";

function Button({
  children,
  className,
  to,
  leftIcon = false,
  rightIcon = false,
  primary = false,
  outline = false,
  rounded = false,
  disabled = false,
  text = false,
  ...passProps
}) {
  let Comp = "button";

  const btnStyles = classNames(
    "flex items-center justify-center text-primary font-normal hover:text-hover transition-colors ease duration-300",
    {
      [className]: className,
      "rounded-[4px] bg-bg-btn-primary": primary && !disabled,
      "bg-transparent border border-solid rounded-[4px]": outline,
      "rounded-[50%]": rounded,
      "opacity-65 cursor-default pointer-events-none select-none": disabled,
    }
  );

  const props = {
    ...passProps,
  };
  if (to) {
    Comp = Link;
    props.to = to;
  } else {
    Comp = "button";
  }

  const handleClick = (e) => {
    e.preventDefault();
  };

  return (
    <Comp disabled={disabled} className={btnStyles} {...props}>
      {leftIcon && <i className="pointer-events-none select-none" onClick={handleClick}>{leftIcon}</i>}
      <span
        onClick={handleClick}
        className="transition-colors ease duration-300 select-none pointer-events-none"
      >
        {children}
      </span>
      {rightIcon && <i className="pointer-events-none select-none" onClick={handleClick}>{rightIcon}</i>}
    </Comp>
  );
}

export default Button;
