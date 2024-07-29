import { useState, useEffect } from "react";

const useControlModal = () => {
  const [isShowModal, setIsShowModal] = useState(false);

  useEffect(() => {
    if (isShowModal) {
      document.body.classList.add("open-modal");

      return;
    }

    document.body.classList.remove("open-modal");
  }, [isShowModal]);

  const handleShowModal = () => {
    setIsShowModal(true);
  };

  const handleCloseModal = () => {
    setIsShowModal(false);
  };

  const handleToggleModal = () => {
    setIsShowModal((state) => !state);
  };

  return { isShowModal, handleCloseModal, handleShowModal, handleToggleModal };
};

export default useControlModal;
