'use client';

import React, { useCallback } from 'react';

import { cn } from '@/lib/utils';

import { Slider } from './Slider';

export interface RangeSliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  className?: string;
  value?: number;
  textValue?: string;
  borderRadius?: number;
  min?: number;
  max?: number;
  yAxis?: boolean;
  disabled?: boolean;
  onChange?: (e: React.PointerEvent<HTMLDivElement> | React.SyntheticEvent, value: number) => void;
  onMove?: (e: React.PointerEvent<HTMLDivElement>, value: number) => void;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  className,
  value = 0,
  textValue = '',
  borderRadius = 2,
  min = 0,
  max = 300,
  yAxis = false,
  disabled = false,
  onChange = () => {},
  onMove = () => {},
  ...props
}) => {
  const calcValueFromPointer = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, el: HTMLDivElement) => {
      const rect = el.getBoundingClientRect();
      const position = !yAxis ? e.clientX - rect.left : rect.bottom - e.clientY;
      const size = !yAxis ? rect.width : rect.height;
      const percentageValue = !yAxis
        ? Math.round((position / size) * 100)
        : Math.floor((position / size) * 100);
      return Math.max(min, Math.min(max, (max / 100) * percentageValue));
    },
    [yAxis, min, max]
  );

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    const currentValue = calcValueFromPointer(e, e.currentTarget);
    onMove(e, currentValue);
  };

  const handleValueChange = (vals: number[]) => {
    const next = vals[0] ?? min;
    onChange({} as React.SyntheticEvent, next);
  };

  return (
    <div
      role="slider"
      className={cn(
        'relative justify-center items-center flex group/wrapperSlider pointer-events-auto cursor-pointer select-none',
        !yAxis ? 'w-[100%] h-[20px]' : 'w-[100%] h-[150px]',
        className
      )}
      aria-valuenow={value}
      aria-valuetext={textValue}
      aria-valuemax={max}
      aria-valuemin={min}
      aria-disabled={disabled}
      aria-orientation={yAxis ? 'vertical' : 'horizontal'}
      onPointerMove={handlePointerMove}
      {...props}
    >
      <Slider
        className={cn('w-full', yAxis && 'h-[150px] flex-col')}
        orientation={yAxis ? 'vertical' : 'horizontal'}
        min={min}
        max={max}
        step={max <= 1 ? 0.01 : 1}
        value={[value]}
        disabled={disabled}
        onValueChange={handleValueChange}
        trackClassName={cn(
          yAxis
            ? 'w-[5px] group-hover/slider:w-[8px] transition-[width] duration-[100ms] h-[100%]'
            : 'h-[5px] group-hover/slider:h-[8px] transition-[height] duration-[100ms] w-[100%]',
          borderRadius ? `rounded-[${borderRadius}px]` : 'rounded-[2px]'
        )}
      />
    </div>
  );
};

export default RangeSlider;
