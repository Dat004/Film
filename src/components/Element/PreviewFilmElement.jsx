import { Fragment, useEffect, useRef, useState, useLayoutEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FaPlay } from "react-icons/fa6";
import { CgMathPlus } from "react-icons/cg";
import { MdDeleteOutline } from "react-icons/md";
import { getDatabase, ref, remove } from "firebase/database";
import classNames from "classnames";

import { setShowPreview } from "../../redux/slices/previewInfoFilmSlice";
import { previewFilmSelector } from "../../redux/selectors";
import ListContainer from "../Container/ListContainer";
import { UserAuth } from "../../context/AuthContext";
import { FlexContainer, FlexItems } from "../Flex";
import Container from "../Container";
import Button from "../Button";

function PreviewFilmElement({ className, data = {}, ...props }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const previewRef = useRef();

  const { list_watching, uid } = UserAuth();
  const [isAlreadyWatchList, setIsAlReadyWatchList] = useState(false);
  const [isShowMenu, setIsShowMenu] = useState(false);

  const {
    position: { x, y },
  } = useSelector(previewFilmSelector);

  useLayoutEffect(() => {
    const isAlready = list_watching.some((watch) =>
      watch.data.find((value) => value?._id === data?._id)
    );

    setIsAlReadyWatchList(isAlready);
  }, [data, list_watching]);

  useEffect(() => {
    const rect = previewRef.current.getBoundingClientRect();

    const l =
      rect.left + rect.width >= window.innerWidth
        ? rect.left - rect.width
        : rect.left;
    const t =
      rect.top + rect.height >= window.innerHeight
        ? rect.top - rect.height
        : rect.top;

    previewRef.current.style.left = l + "px";
    previewRef.current.style.top = t + "px";
  }, [data]);

  useEffect(() => {
    if (isShowMenu) window.addEventListener("click", handleToggleMenu);

    return () => {
      window.removeEventListener("click", handleToggleMenu);
    };
  }, [isShowMenu]);

  const previewClasses = classNames(
    "!bg-[rgba(81,80,100,0.6)] !rounded-[8px] backdrop-blur-[10px]",
    {
      [className]: className,
    }
  );

  const handleToggleMenu = (e) => {
    e.stopPropagation();

    setIsShowMenu((state) => !state);
  };

  const handleDirectionPage = () => {
    navigate(`/phim/${data?.slug}`);
  };

  const handleRemoveVideoToList = async () => {
    const db = getDatabase();
    const dbRef = ref(db, `/list_video/${uid}/${data?._id}`);

    try {
      await remove(dbRef);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Container
      ref={previewRef}
      className={previewClasses}
      style={{ left: x, top: y }}
      {...props}
    >
      <div onClick={handleToggleMenu} className="p-[15px]">
        {!Object.keys(data).length ? (
          <FlexContainer className="items-center justify-center">
            <div style={{ width: "25px" }} className="loader"></div>
          </FlexContainer>
        ) : (
          <>
            <header className="mb-[15px]">
              <h3 className="text-[16px] text-primary font-semibold">
                {data?.name}
              </h3>
            </header>
            <p className="line-clamp-4 text-[13px] leading-[1.25] text-title whitespace-normal mb-[15px]">
              {data?.content}
            </p>
            {data?.origin_name && (
              <p className="text-[13px] leading-[1.33] text-title line-clamp-2">
                Tên gốc:
                <span className="text-primary ml-[4px] whitespace-normal">
                  {data?.origin_name}
                </span>
              </p>
            )}
            {data?.year && (
              <p className="text-[13px] leading-[1.33] text-title line-clamp-2">
                Năm:
                <span className="text-primary ml-[4px] whitespace-normal">
                  {data?.year}
                </span>
              </p>
            )}
            {data?.status && (
              <p className="text-[13px] leading-[1.33] text-title line-clamp-2">
                Trạng thái:
                <span
                  className="text-primary ml-[
                4px] whitespace-normal"
                >
                  {data?.status === "ongoing"
                    ? "Đang phát hành"
                    : data?.status === "completed"
                    ? "Đã hoàn thành"
                    : "Đang cập nhật"}
                </span>
              </p>
            )}
            {!!data?.category?.length && (
              <p className="text-[13px] leading-[1.33] text-title line-clamp-2">
                Thể loại:
                {data?.category?.map((item, index) => (
                  <Fragment key={index}>
                    <Link
                      to={`/the-loai/${item.slug}`}
                      className="text-primary ml-[4px] whitespace-normal hover:underline"
                    >
                      {item?.name}
                    </Link>
                    {index < data?.category?.length - 1 && <span>,</span>}
                  </Fragment>
                ))}
              </p>
            )}
            <FlexContainer className="mt-[20px]">
              <FlexItems className="!flex-grow !flex-shrink">
                <Button
                  className="bg-[#ffbade] w-[100%] gap-x-[8px] py-[8px] rounded-[999px] text-[14px] font-semibold !text-dark"
                  onClick={handleDirectionPage}
                  leftIcon={<FaPlay />}
                >
                  Watch now
                </Button>
              </FlexItems>
              <FlexItems className="relative !flex-grow-0 !flex-shrink-0 ml-[10px]">
                <Button
                  rounded
                  onClick={
                    !isAlreadyWatchList
                      ? handleToggleMenu
                      : handleRemoveVideoToList
                  }
                  title={
                    !isAlreadyWatchList
                      ? "Thêm vào danh sách phát"
                      : "Xóa khỏi danh sách phát"
                  }
                  className="bg-bg-white p-[7px] !text-dark"
                >
                  <i className="text-[23px]">
                    {!isAlreadyWatchList ? <CgMathPlus /> : <MdDeleteOutline />}
                  </i>
                </Button>
                <ListContainer
                  dataFilm={data}
                  xRight
                  yBottom
                  isShow={isShowMenu && !isAlreadyWatchList}
                />
              </FlexItems>
            </FlexContainer>
          </>
        )}
      </div>
    </Container>
  );
}

export default PreviewFilmElement;
