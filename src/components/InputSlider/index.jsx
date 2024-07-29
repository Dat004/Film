import classNames from "classnames";

import { FlexContainer } from "../Flex";

function InputSlider({
  className,
  borderRadius,
  value = 0,
  max = 0,
  min = 0,
  step = 0.0001,
  disabled = false,
  handleDrag = () => {},
  handleDrop = () => {},
  onChange = () => {},
  ...props
}) {
  const sliderStyles = classNames(
    "relative items-center w-[100%] h-[4px] transition-transform bg-bg-slider-color group/slider",
    {
      [className]: className,
    }
  );

  return (
    <FlexContainer
      style={{ borderRadius: borderRadius + "px" }}
      className={sliderStyles}
    >
      <input
        style={{ borderRadius: borderRadius + "px" }}
        className="w-[100%]"
        name="slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onTouchStart={(e) => handleDrag(+e.target.value)}
        onTouchMove={(e) => handleDrag(+e.target.value)}
        onTouchEnd={handleDrop}
        onTouchCancel={handleDrop}
        onMouseDown={(e) => handleDrag(+e.target.value)}
        onMouseUp={handleDrop}
        onChange={(e) => onChange(+e.target.value)}
        disabled={disabled}
        {...props}
      />
      <span
        style={{
          width: `calc(${(value / max) * 100}%)`,
          borderRadius: borderRadius + "px",
        }}
        className="track-cls absolute top-0 left-0 h-[100%] cursor-pointer pointer-events-none select-none z-[5]"
      ></span>
      <span
        style={{
          left: `calc(${(value / max) * 100}%)`,
          borderRadius: borderRadius + "px",
        }}
        className="thumb-cls opacity-0 absolute top-[50%] translate-x-[-50%] transition-opacity duration-[250ms] size-[12px] rounded-[50%] translate-y-[-50%] cursor-pointer pointer-events-none group-hover/slider:opacity-[100] select-none z-[10]"
      ></span>
    </FlexContainer>
  );
}

export default InputSlider;
