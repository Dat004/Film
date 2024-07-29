import { AnimatePresence, motion } from "framer-motion";
import { RiCloseLargeFill } from "react-icons/ri";

import Container from "../Container";
import Button from "../Button";
import Modal from "./";

function ContentModal({
  content = "",
  onClose = () => {},
  isShowModal = false,
}) {
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
            <Container className="w-[625px] mdm:w-[85%] min-h-[220px] h-[500px] rounded-[5px] mx-auto">
              <div className="p-[15px] flex justify-end">
                <Button onClick={onClose} rounded>
                  <RiCloseLargeFill className="text-[18px]" />
                </Button>
              </div>
              <div className="px-[32px] overflow-auto max-h-[calc(100%-72px)]">
                <p className="text-[14px] text-primary leading-[1.5] font-normal">
                  <span className="whitespace-normal">{content}</span>
                </p>
              </div>
            </Container>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
}

export default ContentModal;
