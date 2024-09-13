import classNames from "classnames";
import { useEffect, useState } from "react";

import images from "../../assets/images";

function Image({
  className,
  src = "",
  cover = false,
  contain = false,
  alt = '',
  ...props
}) {
  const [fallBack, setFallBack] = useState(src || images.imgLoadingVertical);

  const imageStyles = classNames("w-[100%] h-full", {
    [className]: className,
    "object-cover": cover,
    "object-contain": contain,
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
      src={fallBack}
      alt={alt}
      {...props}
    />
  );
}

export default Image;
