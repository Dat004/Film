import { useRef } from "react";
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
  onClick = () => {},
  ...passProps
}) {
  const btnRef = useRef();
  const rippleRef = useRef();

  let Comp = "button";

  const btnStyles = classNames(
    "relative flex items-center justify-center text-primary font-normal hover:text-hover transition-colors ease duration-300 overflow-hidden",
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
    const positionLeft =
      e.clientX - btnRef.current.getBoundingClientRect().left;
    const positionTop = e.clientY - btnRef.current.getBoundingClientRect().top;

    rippleRef.current.style.top = `${positionTop}px`;
    rippleRef.current.style.left = `${positionLeft}px`;

    rippleRef.current.classList.add("ripple-frame");

    setTimeout(() => {
      rippleRef.current.classList.remove("ripple-frame");
    }, 400);

    onClick(e);
  };

  return (
    <Comp
      className={btnStyles}
      ref={btnRef}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {leftIcon && <i className="pointer-events-none">{leftIcon}</i>}
      <span className="transition-colors ease duration-300 pointer-events-none">
        {children}
      </span>
      {rightIcon && <i className="">{rightIcon}</i>}
      {!to && (
        <span
          ref={rippleRef}
          className="absolute translate-x-[-50%] translate-y-[-50%] size-[50px] bg-bg-white opacity-0 rounded-[50%] pointer-events-none"
        ></span>
      )}
    </Comp>
  );
}

export default Button;
