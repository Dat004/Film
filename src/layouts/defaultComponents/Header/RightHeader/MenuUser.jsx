import { signOut } from "firebase/auth";
import { Link } from "react-router-dom";

import { FlexContainer, FlexItems } from "../../../../components/Flex";
import { ToastMessage } from "../../../../components/Toastify";
import { UserAuth } from "../../../../context/AuthContext";
import { auth } from "../../../../configs/firebaseConfig";
import Container from "../../../../components/Container";
import Button from "../../../../components/Button";
import Image from "../../../../components/Image";
import { LogoutIcon } from "../../../../icons";

function MenuUser({ data = {}, dataMenu = [], onClose = () => {} }) {
  const { displayName, email } = data;
  const { avatar } = UserAuth();

  const handleLogout = async () => {
    await signOut(auth);

    ToastMessage.success("Đã đăng xuất ra khỏi tài khoản!");
    onClose();
  };

  return (
    <Container>
      <header className="py-[12px] px-[15px] border-b border-solid border-bd-filed-form-color">
        <FlexContainer className="items-center">
          <FlexItems className="size-[32px]">
            <Image cover className="rounded-[50%]" src={avatar} />
          </FlexItems>
          <FlexItems className="text-[14px] text-primary ml-[10px]">
            <p className="font-medium leading-[1.18]">{displayName}</p>
            <p className="leading-[1.18]">{email}</p>
          </FlexItems>
        </FlexContainer>
      </header>
      {dataMenu.map((item) => {
        const { Icon } = item;

        return (
          <Link className="text-primary" key={item.id} to={item.path}>
            <FlexContainer className="p-[12px] px-[15px] hover:bg-bg-multiport items-center">
              <FlexItems>
                <i className="block size-[20px]">
                  <Icon width="100%" height="100%" />
                </i>
              </FlexItems>
              <FlexItems className="ml-[10px]">
                <p className="text-[14px] font-normal">{item.title}</p>
              </FlexItems>
            </FlexContainer>
          </Link>
        );
      })}
      <footer className="border-t border-solid border-bd-filed-form-color">
        <Button
          onClick={handleLogout}
          className="py-[12px] px-[15px] hover:bg-bg-multiport text-[14px] text-primary !justify-start w-[100%] gap-x-[10px] font-normal"
          leftIcon={<LogoutIcon />}
        >
          Đăng xuất
        </Button>
      </footer>
    </Container>
  );
}

export default MenuUser;
