import classNames from "classnames";
import { FcGoogle } from "react-icons/fc";

import Button from ".";

function GoogleButtonLogin({ className, ...props }) {
  const btnStyles = classNames(
    "btnLogin bg-bg-field gap-x-[8px] text-[13px] py-[8px] px-[12px] font-medium rounded-[4px]",
    {
      [className]: className,
    }
  );

  return (
    <Button
      className={btnStyles}
      leftIcon={<FcGoogle className="text-[20px]" />}
      {...props}
    >
      Đăng nhập bằng Google
    </Button>
  );
}

export default GoogleButtonLogin;
