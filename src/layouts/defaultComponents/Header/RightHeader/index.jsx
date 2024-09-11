import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import LoginModal from "../../../../components/Modal/LoginModal";
import { UserAuth } from "../../../../context/AuthContext";
import { useControlModal } from "../../../../hooks";
import Button from "../../../../components/Button";
import Image from "../../../../components/Image";
import images from "../../../../assets/images";
import data from "../../../../data";
import MenuUser from "./MenuUser";

function RightHeader() {
  const navigate = useNavigate();

  const [showMenu, setShowMenu] = useState(false);

  const { dataUserMenu } = data;

  useEffect(() => {
    window.addEventListener("click", handleCloseMenu);

    return () => {
      window.removeEventListener("click", handleCloseMenu);
    };
  }, [showMenu]);

  const { lg, uf } = UserAuth();
  const { isShowModal, handleToggleModal, handleCloseModal } =
    useControlModal();

  const handleCloseMenu = () => {
    setShowMenu(false);
  };

  const handleToggleMenu = () => {
    setShowMenu((state) => !state);
  };

  return (
    <div className="flex items-center gap-[16px]">
      <Button onClick={() => navigate("/search")}>
        <img src={images.searchIcon} alt="search" />
      </Button>
      {lg ? (
        <div className="relative">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              
              handleToggleMenu();
            }}
            rounded
            className="size-[35px]"
          >
            <Image src={uf.photoUrl} className="rounded-[50%]" />
          </Button>
          {showMenu && (
            <div className="absolute right-0 top-[calc(100%+15px)]">
              <MenuUser
                data={uf}
                dataMenu={dataUserMenu}
                onClose={handleCloseMenu}
              />
            </div>
          )}
        </div>
      ) : (
        <>
          <Button
            onClick={handleToggleModal}
            className="text-[14px] text-thirty"
          >
            Đăng nhập
          </Button>
          <LoginModal onClose={handleCloseModal} isShowModal={isShowModal} />
        </>
      )}
    </div>
  );
}

export default RightHeader;
