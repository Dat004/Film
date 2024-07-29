import classNames from "classnames";
import { useEffect, useState } from "react";

function Image({
  className,
  src = "",
  cover = false,
  contain = false,
  ...props
}) {
  const [fallBack, setFallBack] = useState(src);

  const imageStyles = classNames("w-[100%] h-full", {
    [className]: className,
    "object-cover": cover,
    "object-contain": contain,
  });

  useEffect(() => {
    setFallBack(src);
  }, [src]);

  const handleFallBack = () => {};

  return (
    <img
      className={imageStyles}
      onError={handleFallBack}
      src={fallBack}
      {...props}
    />
  );
}

export default Image;
