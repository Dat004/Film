import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";

import { FlexContainer, FlexItems } from "../../../../components/Flex";
import { setAccessToken } from "../../../../redux/slices/authSlice";
import Container from "../../../../components/Container";
import { useLocalStorage } from "../../../../hooks";
import Button from "../../../../components/Button";
import Image from "../../../../components/Image";
import { LogoutIcon } from "../../../../icons";
import configs from "../../../../configs";

function MenuUser({ data = {}, dataMenu = [], onClose = () => {} }) {
  const dispatch = useDispatch();

  const {
    keyConfig: {
      localStorageKey: { accessToken },
    },
  } = configs;

  const { removeItem } = useLocalStorage();

  const handleLogout = () => {
    removeItem(accessToken);
    dispatch(setAccessToken(""));

    onClose();
  };

  return (
    <Container>
      <header className="py-[12px] px-[15px] border-b border-solid border-bd-filed-form-color">
        <FlexContainer className="items-center">
          <FlexItems className="size-[32px]">
            <Image className="rounded-[50%]" src={data.picture} />
          </FlexItems>
          <FlexItems className="text-[14px] text-primary ml-[10px]">
            <p className="font-medium leading-[1.18]">{data.name}</p>
            <p className="leading-[1.18]">{data.email}</p>
          </FlexItems>
        </FlexContainer>
      </header>
      {dataMenu.map((item) => {
        const { Icon } = item;

        return (
          <Link className="text-primary" key={item.id} to={item.path}>
            <FlexContainer className="p-[12px] px-[15px] items-center">
              <FlexItems>
                <Icon />
              </FlexItems>
              <FlexItems className="ml-[10px]">
                <p className="text-[14px] font-normal">{item.title}</p>
              </FlexItems>
            </FlexContainer>
          </Link>
        );
      })}
      <footer className="py-[12px] px-[15px] border-t border-solid border-bd-filed-form-color">
        <Button
          onClick={handleLogout}
          className="text-[14px] text-primary !justify-start w-[100%] gap-x-[10px] font-normal"
          leftIcon={<LogoutIcon />}
        >
          Đăng xuất
        </Button>
      </footer>
    </Container>
  );
}

export default MenuUser;
