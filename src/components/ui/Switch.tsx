'use client';

import * as SwitchPrimitives from '@radix-ui/react-switch';
import * as React from 'react';

import { cn } from '@/lib/utils';

const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bg-green focus-visible:ring-offset-2 focus-visible:ring-offset-bg-player',
      'disabled:cursor-not-allowed disabled:opacity-50',
      // Track: green when on; muted slider token when off (remapped inside .video-player-chrome).
      // Soft inset ring so the track stays visible even when the token is translucent.
      'data-[state=checked]:bg-bg-green data-[state=unchecked]:bg-bg-slider-color',
      'data-[state=unchecked]:shadow-[inset_0_0_0_1px_rgba(15,23,42,0.14)]',
      'data-[state=checked]:shadow-none',
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        'pointer-events-none block h-4 w-4 rounded-full bg-white shadow-md ring-1 ring-black/20 transition-transform',
        'data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0'
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
