import { useNavigate } from "react-router-dom";

import LoginModal from "../../../components/Modal/LoginModal";
import { useControlModal } from "../../../hooks";
import Button from "../../../components/Button";
import images from "../../../assets/images";

function RightHeader({ dataCategory = [] }) {
  const navigate = useNavigate();

  const { isShowModal, handleToggleModal, handleCloseModal } =
    useControlModal();

  return (
    <div className="flex items-center gap-[16px]">
      <Button onClick={() => navigate("/search")}>
        <img src={images.searchIcon} alt="search" />
      </Button>
      <Button onClick={handleToggleModal} className="text-[14px] text-thirty">
        Đăng nhập
      </Button>
      <LoginModal onClose={handleCloseModal} isShowModal={isShowModal} />
    </div>
  );
}

export default RightHeader;
