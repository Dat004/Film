import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaCheck } from "react-icons/fa6";
import compareImages from "resemblejs/compareImages";

import { FlexContainer, FlexItems } from "../Flex";
import Container from "../Container";
import Button from "../Button";
import data from "../../data";
import Image from "../Image";
import Modal from ".";

function AvatarModal({
  currentImg = "",
  onClose = () => {},
  isShowModal = false,
  handleSelectAvt = () => {},
}) {
  const [id, setId] = useState(null);

  useEffect(() => {
    if (currentImg?.startsWith("https://lh3")) return;

    (async () => {
      for (let i = 0; i < data.dataAvatar.length; i++) {
        const compareImg = await compareImages(currentImg, data.dataAvatar[i]);

        if (compareImg.rawMisMatchPercentage === 0) {
          setId(i);

          break;
        }
      }
    })();
  }, [currentImg]);

  const variants = {
    hide: {
      y: "-10%",
      opacity: 0,
    },
    show: {
      y: 0,
      opacity: 1,
    },
  };

  const handleCreateImageBlobURL = async (url) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();

      const base64String = await convertImageToBase64(blob);

      handleSelectAvt(base64String);
    } catch (e) {
      return e;
    }
  };

  async function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result); // Trả về chuỗi base64
      reader.onerror = reject; // Xử lý lỗi nếu có
      reader.readAsDataURL(file); // Đọc file và chuyển thành Data URL
    });
  }

  return (
    <AnimatePresence>
      {isShowModal && (
        <Modal isShowModal={isShowModal} onClose={onClose}>
          <motion.div
            variants={variants}
            initial="hide"
            animate="show"
            transition="duration-300"
            exit="hide"
          >
            <Container className="mx-auto w-[500px] mdm:w-[85%] kdm:w-[90%] p-[30px]">
              <header className="mb-[20px]">
                <h2 className="text-primary text-center text-[20px] font-bold">
                  Choose Avatar
                </h2>
              </header>
              <section>
                <FlexContainer className="!gap-y-[20px]" isWrap>
                  {data.dataAvatar.map((avt, index) => (
                    <FlexItems
                      onClick={() => handleCreateImageBlobURL(avt)}
                      className={`w-[25%] ssm:w-[calc(100%/3)] px-[10px] ${
                        id === index
                          ? "scale-100 opacity-100"
                          : "scale-[0.8] opacity-30"
                      } transition-all duration-[250ms] hover:opacity-100 hover:scale-100 flex-grow-0 flex-shrink-0`}
                      key={index}
                    >
                      <div className="relative">
                        <div className="cursor-pointer">
                          <Image className="rounded-[50%]" src={avt} cover />
                        </div>
                        {id === index && (
                          <div className="absolute top-0 right-0 size-[30px]">
                            <div className="flex justify-center items-center w-[100%] size-[100%] rounded-[50%] bg-bg-white">
                              <i className="text-[18px]">
                                <FaCheck />
                              </i>
                            </div>
                          </div>
                        )}
                      </div>
                    </FlexItems>
                  ))}
                </FlexContainer>
              </section>
              <footer className="mt-[20px]">
                <Button
                  primary
                  onClick={onClose}
                  className="w-[100%] py-[12px] text-[14px] leading-[1.25] text-primary font-semibold"
                >
                  Close
                </Button>
              </footer>
            </Container>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
}

export default AvatarModal;
