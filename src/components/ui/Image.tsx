import React, { useEffect, useState } from 'react';

import images from '@/assets/images';
import { cn } from '@/lib/utils';

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string | undefined;
  src?: string | undefined;
  cover?: boolean | undefined;
  contain?: boolean | undefined;
  alt?: string | undefined;
}

export function Image({
  className,
  src = '',
  cover = false,
  contain = false,
  alt = '',
  ...props
}: ImageProps) {
  const [fallBack, setFallBack] = useState<any>(src || images.imgLoadingVertical);

  const imageStyles = cn('w-[100%] h-full', {
    [className || '']: className,
    'object-cover': cover,
    'object-contain': contain,
  });

  useEffect(() => {
    if (src) {
      setFallBack(src);
    }
  }, [src]);

  const handleFallBack = () => {
    setFallBack(images.imgLoadingVertical);
  };

  return (
    <img
      className={imageStyles}
      onError={handleFallBack}
      src={fallBack?.src || fallBack}
      alt={alt}
      {...props}
    />
  );
}

export default Image;
