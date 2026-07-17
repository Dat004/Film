import React from 'react';

import { cn } from '@/lib/utils';

export interface FieldValueProps extends React.InputHTMLAttributes<HTMLInputElement> {
  disabled?: boolean;
  label?: string;
  fieldName?: string;
}

const FieldValue: React.FC<FieldValueProps> = ({
  disabled = false,
  label = '',
  fieldName = '',
  className,
  ...props
}) => {
  const fieldClasses = cn('px-[15px] py-[8px] rounded-[5px] mt-[8px] border border-solid', {
    [className || '']: className,
    'field-value-disabled cursor-not-allowed': disabled,
    'border-bd-filed-form-color/25 bg-bg-white': !disabled,
  });

  return (
    <div className="mb-[20px]">
      <label className="uppercase text-[12px] text-title font-medium" htmlFor={fieldName}>
        {label}
      </label>
      <div className={fieldClasses}>
        <input
          className="w-[100%] h-[100%] border-0 bg-transparent text-[16px] detail769:text-[14px] text-dark font-normal outline-none disabled:cursor-not-allowed disabled:text-secondary"
          disabled={disabled}
          name={fieldName}
          id={fieldName}
          {...props}
        />
      </div>
    </div>
  );
};

export default FieldValue;
