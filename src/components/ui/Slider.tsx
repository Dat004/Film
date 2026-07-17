'use client';

import * as SliderPrimitive from '@radix-ui/react-slider';
import * as React from 'react';

import { cn } from '@/lib/utils';

const Slider = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    orientation?: 'horizontal' | 'vertical';
    trackClassName?: string;
    rangeClassName?: string;
    thumbClassName?: string;
  }
>(
  (
    {
      className,
      orientation = 'horizontal',
      trackClassName,
      rangeClassName,
      thumbClassName,
      ...props
    },
    ref
  ) => (
    <SliderPrimitive.Root
      ref={ref}
      orientation={orientation}
      className={cn(
        'relative flex touch-none select-none items-center',
        orientation === 'horizontal' ? 'w-full h-[20px]' : 'h-[150px] w-full flex-col',
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        className={cn(
          'relative grow overflow-hidden rounded-[2px] bg-bg-slider-color',
          orientation === 'horizontal'
            ? 'h-[5px] w-full group-hover/slider:h-[8px] transition-[height] duration-[100ms]'
            : 'w-[5px] h-full group-hover/slider:w-[8px] transition-[width] duration-[100ms]',
          trackClassName
        )}
      >
        <SliderPrimitive.Range
          className={cn(
            'absolute bg-bg-process-slider-color',
            orientation === 'horizontal' ? 'h-full' : 'w-full',
            rangeClassName
          )}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className={cn(
          'block size-[14px] rounded-full bg-bg-white opacity-0 transition-opacity duration-[250ms] focus-visible:opacity-100 group-hover/wrapperSlider:opacity-100 focus:outline-none disabled:pointer-events-none disabled:opacity-50',
          thumbClassName
        )}
      />
    </SliderPrimitive.Root>
  )
);
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
