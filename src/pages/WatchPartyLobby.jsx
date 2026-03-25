/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPublicRooms } from "../services/firebase/watchPartyService";
import SEO from "../components/SEO";
import { FlexContainer, FlexItems } from "../components/Flex";
import { RiFilmLine, RiGroupLine, RiArrowRightLine, RiCompass3Line } from "react-icons/ri";
import { LazyLoadImage } from "react-lazy-load-image-component";
import SkeletonContainer from "../components/Skeleton";
import images from "../assets/images";

const DEFAULT_AVATAR_URL = "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix";

function WatchPartyLobby() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const publicRooms = await getPublicRooms();
        setRooms(publicRooms);
      } catch (err) {
        console.error("Lỗi khi tải danh sách phòng:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const totalViewers = rooms.reduce(
    (acc, r) => acc + (r.members ? Object.keys(r.members).length : 0),
    0
  );

  return (
    <div className="bg-bg-layout text-primary min-h-[85vh] py-12 px-[15px] transition-colors duration-300">
      <div className="max-w-[1100px] mx-auto">
        {/* Header */}
        <div className="bg-bg-sidebar border border-bd-filed-form-color rounded-[8px] p-[26px_28px] mb-9 flex justify-between items-center gap-5 flex-wrap relative before:content-[''] before:absolute before:left-0 before:top-[14px] before:bottom-[14px] before:w-1 before:bg-[var(--primary-color)] max-[560px]:flex-col max-[560px]:items-stretch shadow-lg">
          <div>
            <h1 className="font-bold text-[30px] m-0 mb-1 text-primary flex items-center gap-[10px] max-[560px]:text-[25px]">
              <RiFilmLine size={26} className="text-[var(--primary-color)] shrink-0" />
              Phòng Xem Chung
            </h1>
            <p className="m-0 text-[13.5px] text-secondary">Danh sách các phòng đang chiếu công khai, hãy chọn một phòng để tham gia xem cùng mọi người.</p>
          </div>

          {!loading && rooms.length > 0 && (
            <div className="bg-bg-field border border-bd-filed-form-color rounded-[4px] p-[12px_18px] text-[12px] text-primary whitespace-nowrap max-[560px]:whitespace-normal">
              Thống kê hôm nay: <b className="text-[var(--primary-color)]">{rooms.length} phòng</b> · <b className="text-[var(--primary-color)]">{totalViewers} người</b> đang xem
            </div>
          )}
        </div>

        {loading ? (
          <FlexContainer className="mx-[-12px] pb-[24px] items-start" isWrap>
            {Array.from({ length: 6 }).map((_, index) => (
              <FlexItems
                className="w-[calc(100%/4)] xsm:w-[100%] ssm:w-[calc(100%/2)] lgm:w-[calc(100%/3)] xlm:w-[calc(100%/4)] px-[12px] mb-6"
                key={index}
              >
                <div className="bg-bg-sidebar border border-bd-filed-form-color rounded-[8px] overflow-hidden flex flex-col h-[380px] transition-all duration-200">
                  <div className="h-[160px] rounded-[6px] overflow-hidden border border-bd-filed-form-color shrink-0 relative bg-bg-field">
                    <SkeletonContainer />
                  </div>
                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <div className="h-3 rounded-[3px] bg-bg-field relative overflow-hidden" style={{ width: "40%" }}>
                      <SkeletonContainer />
                    </div>
                    <div className="h-5 rounded-[3px] bg-bg-field relative overflow-hidden" style={{ width: "85%" }}>
                      <SkeletonContainer />
                    </div>
                    <div className="h-3 rounded-[3px] bg-bg-field relative overflow-hidden" style={{ width: "60%" }}>
                      <SkeletonContainer />
                    </div>
                    <div className="h-[38px] rounded-[4px] mt-auto bg-bg-field relative overflow-hidden">
                      <SkeletonContainer />
                    </div>
                  </div>
                </div>
              </FlexItems>
            ))}
          </FlexContainer>
        ) : rooms.length === 0 ? (
          <div className="max-w-[460px] mx-auto mt-[30px] text-center bg-bg-sidebar border border-bd-filed-form-color rounded-[6px] p-[44px_30px] shadow-lg">
            <RiCompass3Line size={32} className="text-[var(--primary-color)] mx-auto mb-[14px]" />
            <h3 className="text-[19px] m-0 mb-[10px] text-primary font-bold">Danh sách phòng đang trống</h3>
            <p className="text-[13.5px] text-secondary leading-[1.6] m-0 mb-5">
              Chưa có phòng xem chung công khai nào được mở. Hãy chọn một phim bất kỳ và bấm{" "}
              <strong className="text-[var(--primary-color)]">&quot;Tạo Phòng Xem Chung&quot;</strong> để tạo phòng chiếu đầu tiên!
            </p>
            <button 
              type="button" 
              onClick={() => navigate("/")}
              className="bg-bg-btn-primary text-primary hover:text-hover border-none rounded-[4px] font-semibold text-[13.5px] py-[11px] px-[20px] inline-flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <RiCompass3Line size={17} />
              Tìm Phim Xem Ngay
            </button>
          </div>
        ) : (
          <FlexContainer className="mx-[-12px] pb-[24px] items-start" isWrap>
            {rooms.map((room) => {
              const roomId = room.roomId || "";
              const membersCount = room.members ? Object.keys(room.members).length : 0;
              const movieName = room.filmData?.movie?.name || "Phim ẩn danh";
              const categoryName = room.filmData?.movie?.category?.[0]?.name;
              const shelfLabel = categoryName ? `${categoryName.toUpperCase()}` : "PHIM MỚI";
              const hostMember = room.members?.[room.hostId] || { displayName: "Ẩn danh", photoURL: "" };

              return (
                <FlexItems
                  className="w-[calc(100%/4)] xsm:w-[100%] ssm:w-[calc(100%/2)] lgm:w-[calc(100%/3)] xlm:w-[calc(100%/4)] px-[12px] mb-6"
                  key={roomId}
                >
                  <div className="bg-bg-sidebar relative border border-bd-filed-form-color rounded-[8px] overflow-hidden flex flex-col min-h-[380px] transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_10px_22px_rgba(0,0,0,0.15)] hover:border-hover group h-full">
                    <div className="absolute top-4 right-[14px] z-[2] border-[1.5px] border-hover text-hover font-bold text-[9.5px] tracking-[0.04em] p-[3px_7px] rounded-[3px] rotate-[8deg] bg-bg-sidebar/85 shadow-sm">
                      ĐANG CHIẾU
                    </div>

                    <div className="w-full rounded-[6px] overflow-hidden border border-bd-filed-form-color shrink-0 relative">
                      <div className="relative pb-[100%] h-0 leading-0">
                        <div className="absolute inset-0 overflow-hidden">
                          <LazyLoadImage
                            placeholderSrc={images.imgLoadingVertical}
                            className="block h-full object-contain hover:scale-[1.15] transition-transform duration-[350ms] will-change-contents rounded-[5px]"
                            alt={movieName}
                            src={room?.filmData?.movie?.poster_url}
                            height="100%"
                            width="100%"
                            effect="opacity"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <span className="text-[10px] text-hover font-semibold tracking-[0.06em]">{shelfLabel}</span>
                      <h3 title={movieName} className="font-semibold text-base leading-[1.3] m-0 text-primary line-clamp-2">
                        {movieName}
                      </h3>

                      <div className="text-[10.5px] text-secondary">
                        PHÒNG&nbsp;<span className="text-primary font-medium">#{roomId ? roomId.slice(0, 8).toUpperCase() : ""}</span>
                      </div>

                      <div className="flex items-center justify-between mt-[2px]">
                        <div className="flex items-center gap-1.5 text-[11.5px] text-secondary min-w-0">
                          <img
                            src={hostMember.photoURL || DEFAULT_AVATAR_URL}
                            alt="host"
                            className="w-5 h-5 rounded-full border border-bd-filed-form-color shrink-0 object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = DEFAULT_AVATAR_URL;
                            }}
                          />
                          <span className="overflow-hidden text-ellipsis whitespace-nowrap">{hostMember.displayName || "Ẩn danh"}</span>
                        </div>
                        <span className="flex items-center gap-1 text-[11px] text-secondary shrink-0">
                          <RiGroupLine size={13} /> {membersCount}/20
                        </span>
                      </div>

                      <button
                        className="mt-auto bg-bg-btn-primary text-primary hover:text-hover font-semibold text-[13px] border-none rounded-[4px] p-[11px_14px] flex items-center justify-center gap-[7px] cursor-pointer transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
                        type="button"
                        onClick={() => navigate(`/watch-party/${roomId}`)}
                      >
                        Vào Xem Ngay
                        <RiArrowRightLine size={15} />
                      </button>
                    </div>
                  </div>
                </FlexItems>
              );
            })}
          </FlexContainer>
        )}
      </div>

      <SEO
        url={window.location.href}
        title="Sảnh Phòng Xem Chung - Watch Party Lobby"
        description="Tham gia cùng mọi người xem các bộ phim hành động, hoạt hình, truyền hình mới nhất hoàn toàn trực tuyến và đồng bộ."
      />
    </div>
  );
}

export default WatchPartyLobby;
