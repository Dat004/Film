import classNames from "classnames";

function FieldValue({
  disabled = false,
  label = "",
  fieldName = "",
  className,
  ...props
}) {
  const fieldClasses = classNames(
    "bg-bg-white px-[15px] py-[8px] rounded-[5px] mt-[8px]",
    {
      [className]: className,
      "cursor-not-allowed !bg-bg-disabled": disabled,
    }
  );

  return (
    <div className="mb-[20px]">
      <label
        className="uppercase text-[12px] text-title font-medium"
        htmlFor={fieldName}
      >
        {label}
      </label>
      <div className={fieldClasses}>
        <input
          className="w-[100%] h-[100%] text-[14px] text-dark font-normal disabled:text-primary disabled:cursor-not-allowed"
          disabled={disabled}
          name={fieldName}
          id={fieldName}
          {...props}
        />
      </div>
    </div>
  );
}

export default FieldValue;
