import { useEffect, useState } from "react";
import { MdEdit } from "react-icons/md";
import { MdPerson, MdPersonOff } from "react-icons/md";

import { useControlModal, useRealtimeDbFirebase } from "../../hooks";
import { FlexContainer, FlexItems } from "../../components/Flex";
import AvatarModal from "../../components/Modal/AvatarModal";
import { ToastMessage } from "../../components/Toastify";
import { UserAuth } from "../../context/AuthContext";
import Button from "../../components/Button";
import Image from "../../components/Image";
import { PersonIcon } from "../../icons";
import FieldValue from "./FieldValue";

function ProfileScreen({ data = {}, uid = "" }) {
  const { createdAt, email, displayName, emailVerified } = data;
  const { avatar } = UserAuth();
  const { isShowModal, handleCloseModal, handleShowModal } = useControlModal();
  const { updateDb } = useRealtimeDbFirebase();

  const time = new Date(+createdAt).toLocaleDateString();

  const [value, setValue] = useState({
    image: avatar,
    name: displayName,
  });

  useEffect(() => {
    setValue({ name: displayName, image: avatar });
  }, [displayName, avatar]);

  const handleSelectAvatar = (avt) => {
    setValue((state) => ({ ...state, image: avt }));
  };

  const handleUpdateUser = async () => {
    if (value.name === displayName && value.image === avatar) return;

    const dbRef = `users/${uid}/currentUser`;
    const updates = {
      displayName: value.name,
      photoUrl: value.image,
    };

    await updateDb({
      path: dbRef,
      options: updates,
      messageSuccess: "Cập nhật thông tin thành công!",
      messageError: "Cập nhật thông tin thất bại!",
    });
  };

  return (
    <section className="max-w-[600px] mx-auto">
      <FlexContainer className="items-center mb-[24px]">
        <i className="text-primary size-[32px] mdm:size-[24px] ccm:size-[20px]">
          <PersonIcon width="100%" height="100%" />
        </i>
        <h1 className="text-primary text-[32px] font-medium mdm:text-[24px] ccm:text-[20px] ml-[10px]">
          Profile
        </h1>
      </FlexContainer>
      <div className="w-[100%] p-[30px] relative bg-bg-block ccm:bg-bg-transparent ccm:p-0">
        <div className="absolute w-[160px] top-0 right-0 h-[100%] slm:relative slm:w-[100%] slm:h-auto slm:flex slm:justify-center slm:items-center slm:mb-[16px]">
          <div className="absolute inset-0 bg-bg-content-area-color slm:hidden"></div>
          <div className="size-[100%] slm:size-[100px] slm:p-0 p-[30px]">
            <div
              onClick={handleShowModal}
              className="relative w-[100%] pb-[100%] cursor-pointer"
            >
              <div className="absolute inset-0">
                <Image className="rounded-[50%]" src={value.image} cover />
              </div>
              <Button
                rounded
                onClick={handleShowModal}
                className="!absolute size-[30px] bg-bg-white bottom-0 right-0"
              >
                <i className="text-dark text-[22px]">
                  <MdEdit />
                </i>
              </Button>
            </div>
            <AvatarModal
              currentImg={value.image}
              isShowModal={isShowModal}
              onClose={handleCloseModal}
              handleSelectAvt={handleSelectAvatar}
            />
          </div>
        </div>
        <section className="pr-[190px] slm:pr-0">
          <form action="">
            <FieldValue
              disabled
              label="Email address"
              value={email || ""}
              fieldName="email"
              type="email"
            />
            <FieldValue
              onChange={(e) =>
                setValue((state) => ({ ...state, name: e.target.value }))
              }
              label="Your name"
              value={value.name || ""}
              fieldName="username"
              type="text"
            />
            <FieldValue
              disabled
              label="Joined"
              value={time || ""}
              fieldName="createdAt"
              type="text"
            />
            <div className="bg-bg-layout ccm:bg-bg-footer rounded-[8px] p-[12px]">
              <FlexContainer
                className={`items-center mb-[4px] ${
                  !emailVerified ? "text-title" : "text-[#66bb6a]"
                }`}
              >
                <i className="text-[18px]">
                  {!emailVerified ? <MdPersonOff /> : <MdPerson />}
                </i>
                <FlexItems className="ml-[4px]">
                  <p className="text-[14px] font-medium">
                    {!emailVerified ? "Not Verified" : "Verified"}
                  </p>
                </FlexItems>
              </FlexContainer>
              <span className="text-[14px] text-primary font-medium leading-[1.25] whitespace-normal">
                {!emailVerified
                  ? "Your account has not been verified."
                  : "Your email has been verified."}
              </span>
            </div>
            <div className="pt-[20px]">
              <Button
                primary
                type="button"
                onClick={handleUpdateUser}
                disabled={value.name === displayName && value.image === avatar}
                className="w-[100%] disabled:!bg-bg-disabled rounded-[4px] hover:text-primary hover:opacity-80 !font-medium h-[42px]"
              >
                Save
              </Button>
            </div>
          </form>
        </section>
      </div>
    </section>
  );
}

export default ProfileScreen;
