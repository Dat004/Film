import { useMemo, useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { videoPlayerSelector } from "../../redux/selectors";
import { UserAuth } from "../../context/AuthContext";
import { destroyRoom, kickMember, transferHost, sendReaction } from "../../services/firebase/watchPartyService";
import PlayerSkeleton from "../../components/Skeleton/PlayerSkeleton";
import Player from "../../layouts/defaultComponents/Player";
import EpisodesPlayer from "../../layouts/defaultComponents/Player/EpisodesPlayer";
import { ToastMessage } from "../../components/Toastify";
import ConfirmModal from "../../components/Modal/ConfirmModal";
import { HiOutlineLockClosed, HiOutlineChevronLeft } from "react-icons/hi2";
import { RiListUnordered, RiChat3Line, RiCloseLargeFill, RiSendPlane2Fill, RiGroupLine, RiDeleteBin6Line, RiInformationLine } from "react-icons/ri";
import { AnimatePresence, motion } from "framer-motion";
import { ShareLinkButton } from "./ShareLinkButton";
import ContentModal from "../../components/Modal/ContentModal";
import Modal from "../../components/Modal";
import Button from "../../components/Button";

// Local subcomponents
import { ErrorScreen } from "./ErrorScreen";
import { ChatPanel } from "./ChatPanel";
import { MemberList } from "./MemberList";

// Custom hooks
import { useRoomSync } from "./hooks/useRoomSync";
import { useVideoSync } from "./hooks/useVideoSync";
import { useChatResize } from "./hooks/useChatResize";

export default function WatchPartyRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { uf, uid, lg } = UserAuth();

  const videoPlayerState = useSelector(videoPlayerSelector);
  const { episode } = videoPlayerState;
  const { currentEpisode } = episode;

  // Floating Reactions State
  const [reactions, setReactions] = useState([]);
  const [isEpisodesOpen, setIsEpisodesOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);


  // Stable user reference
  const user = useMemo(() => ({
    uid,
    displayName: uf?.displayName || "Ẩn danh",
    photoURL: uf?.photoUrl || ""
  }), [uid, uf?.displayName, uf?.photoUrl]);

  // Presence & room sync state
  const {
    roomData,
    error,
    isInitializing,
    isHost,
    messages,
    members,
    memberMap,
    passwordRequired,
    passwordError,
    submitPassword
  } = useRoomSync(roomId, user, lg);

  // Video synchronization state
  useVideoSync(roomId, isHost, isInitializing, roomData?.status);

  // Chat resize state
  const {
    isChatOpen,
    setIsChatOpen,
    chatWidth,
    setIsDragging,
    isMobile
  } = useChatResize();

  // Trigger floating reaction on new emoji arrival in database
  const prevReactionsRef = useRef({});
  useEffect(() => {
    const currentReactions = roomData?.reactions || {};
    Object.keys(currentReactions).forEach((rId) => {
      if (!prevReactionsRef.current[rId]) {
        const reaction = currentReactions[rId];
        if (Date.now() - reaction.timestamp < 4000) {
          const id = rId;
          const left = Math.random() * 70 + 15; // 15% to 85%
          const size = Math.random() * 20 + 24; // 24px to 44px
          const duration = Math.random() * 1.2 + 1.5; // 1.5s to 2.7s
          const rotation = Math.random() * 40 - 20; // -20deg to 20deg
          
          setReactions((prev) => [
            ...prev,
            { id, emoji: reaction.emoji, left, size, duration, rotation }
          ]);
          
          setTimeout(() => {
            setReactions((prev) => prev.filter((r) => r.id !== id));
          }, duration * 1000 + 100);
        }
      }
    });
    prevReactionsRef.current = currentReactions;
  }, [roomData?.reactions]);

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Xác nhận",
    cancelText: "Hủy",
    type: "primary",
    onConfirm: () => {},
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    ToastMessage.success("Đã sao chép link phòng!");
  };

  const handleDestroyRoom = () => {
    setConfirmModal({
      isOpen: true,
      title: "Giải tán phòng chiếu",
      message: "Hành động này sẽ giải tán phòng ngay lập tức. Tất cả mọi người đang xem sẽ bị thoát ra ngoài. Bạn có chắc chắn?",
      confirmText: "Giải tán phòng",
      cancelText: "Hủy",
      type: "danger",
      onConfirm: async () => {
        try {
          await destroyRoom(roomId);
          navigate("/watch-party");
        } catch (err) {
          ToastMessage.error("Lỗi khi hủy phòng!");
        }
      }
    });
  };

  const handleSendReaction = async (emoji) => {
    try {
      await sendReaction(roomId, user, emoji);
    } catch (err) {
      console.error("Lỗi khi gửi emoji:", err);
    }
  };

  const handleLeaveRoom = () => {
    const confirmMessage = isHost && members.length > 1
      ? "Bạn đang là chủ phòng. Nếu bạn rời đi, quyền điều khiển phòng (Host) sẽ được tự động chuyển giao cho thành viên tiếp theo. Bạn có chắc chắn muốn rời phòng?"
      : "Bạn có chắc chắn muốn rời khỏi phòng xem chung này? Bạn sẽ không còn đồng bộ video với mọi người nữa.";

    setConfirmModal({
      isOpen: true,
      title: "Rời phòng xem chung",
      message: confirmMessage,
      confirmText: "Rời phòng",
      cancelText: "Hủy",
      type: "danger",
      onConfirm: () => {
        navigate("/watch-party");
      }
    });
  };

  const handleKickMember = (memberId, displayName) => {
    setConfirmModal({
      isOpen: true,
      title: "Mời thành viên rời phòng",
      message: `Bạn có chắc chắn muốn mời thành viên "${displayName || "Ẩn danh"}" ra khỏi phòng xem chung này?`,
      confirmText: "Mời rời phòng",
      cancelText: "Hủy",
      type: "danger",
      onConfirm: async () => {
        try {
          await kickMember(roomId, memberId);
          ToastMessage.success(`Đã mời ${displayName || "Ẩn danh"} ra khỏi phòng.`);
        } catch (err) {
          ToastMessage.error("Lỗi khi mời thành viên!");
        }
      }
    });
  };

  const handleTransferHost = (memberId, displayName) => {
    setConfirmModal({
      isOpen: true,
      title: "Chuyển quyền chủ phòng",
      message: `Bạn có chắc chắn muốn chuyển quyền chủ phòng cho "${displayName || "Ẩn danh"}"? Bạn sẽ trở thành người xem thường và không thể điều khiển trình phát video nữa.`,
      confirmText: "Chuyển quyền",
      cancelText: "Hủy",
      type: "warning",
      onConfirm: async () => {
        try {
          await transferHost(roomId, memberId);
          ToastMessage.success(`Đã chuyển quyền chủ phòng cho ${displayName || "Ẩn danh"}.`);
        } catch (err) {
          ToastMessage.error("Lỗi khi chuyển quyền!");
        }
      }
    });
  };

  if (error) {
    return <ErrorScreen error={error} onGoBack={() => navigate("/watch-party")} />;
  }

  // Room Password Modal
  if (passwordRequired) {
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 dark:bg-black/80 backdrop-blur-md px-4">
        <div className="max-w-md w-full bg-bg-sidebar border border-bd-filed-form-color rounded-2xl p-8 shadow-2xl flex flex-col items-center">
          <div className="w-16 h-16 bg-[var(--primary-color)]/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-[var(--primary-color)]/30">
            <HiOutlineLockClosed className="w-8 h-8 text-[var(--primary-color)]" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-primary">Yêu cầu mật khẩu</h2>
          <p className="text-secondary text-sm mb-6 text-center">
            Vui lòng nhập mật khẩu chính xác để tham gia phòng xem chung này.
          </p>

          <form onSubmit={(e) => {
            e.preventDefault();
            const pw = e.target.elements.roomPassword.value;
            submitPassword(pw);
          }} className="w-full">
            <input 
              type="password" 
              name="roomPassword"
              placeholder="Mật khẩu phòng..."
              className="w-full bg-bg-field border border-bd-filed-form-color focus:border-[var(--hover-color)] transition-colors rounded-xl px-4 py-3 outline-none text-sm text-primary mb-3 text-center"
              required
              autoFocus
            />
            {passwordError && (
              <p className="text-red-500 text-xs mb-4 text-center">{passwordError}</p>
            )}
            <div className="flex gap-3 w-full">
              <button 
                type="button"
                onClick={() => navigate(-1)} 
                className="flex-1 bg-bg-field hover:bg-black/5 dark:hover:bg-white/5 border border-bd-filed-form-color text-primary font-medium py-3 rounded-xl transition-all"
              >
                Quay Lại
              </button>
              <button 
                type="submit" 
                className="flex-1 bg-[var(--primary-color)] text-bg-sidebar dark:text-black font-semibold py-3 rounded-xl transition-all shadow-lg hover:opacity-90"
              >
                Vào Phòng
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (isInitializing || !roomData || !roomData.filmData) {
    return <PlayerSkeleton />;
  }

  const episodes = roomData?.filmData?.episodes;
  const dataEpisodes = episodes
    ?.map((items) => items?.server_data)
    ?.find((value) => value) || [];

  return (
    <div className="flex flex-col h-screen w-full bg-bg-layout text-primary overflow-hidden select-none">
      {/* Top Header Bar */}
      <div className="h-[60px] border-b border-bd-filed-form-color flex items-center justify-between px-4 bg-bg-sidebar shrink-0 z-30">
        <div className="flex items-center min-w-0">
          {/* Back/Leave Button */}
          <Button 
            onClick={handleLeaveRoom}
            rounded
            className="mr-2 p-2 text-secondary hover:text-red-500 hover:bg-black/10 dark:hover:bg-white/10 shrink-0"
            title="Rời phòng"
          >
            <HiOutlineChevronLeft className="w-5 h-5" />
          </Button>
          
          <section>
            <p className="font-bold text-xs text-hover tracking-wider uppercase shrink-0">Phòng Xem Chung</p>
            <h1 className="font-bold text-sm text-primary truncate max-w-[160px] sm:max-w-[300px] md:max-w-[500px]">
              {roomData.filmData?.movie?.name}
            </h1>
          </section>

          <span className="ml-5 px-2 py-0.5 rounded leading-[1rem] bg-bg-field text-[11px] font-semibold text-secondary shrink-0">
            {dataEpisodes[currentEpisode]?.name || "Tập 1"}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Members counter */}
          <div className="text-xs text-secondary flex items-center gap-1.5 bg-bg-field border border-bd-filed-form-color px-2.5 py-1 rounded-full shrink-0">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>{members.length} đang xem</span>
          </div>

          {/* Share Button */}
          <ShareLinkButton onCopy={handleCopyLink} />

          {/* Host Destroy button */}
          {isHost && (
            <Button 
              onClick={handleDestroyRoom}
              rounded
              className="text-red-500 hover:text-red-600 dark:hover:text-red-400 p-2 hover:bg-red-500/10 shrink-0"
              title="Giải tán phòng"
            >
              <RiDeleteBin6Line className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Workspace below header */}
      <div className="watch-party-container relative flex flex-row max-[768px]:flex-col w-full flex-1 min-h-0 bg-bg-layout text-gray-900 dark:text-white overflow-hidden">
        <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
            transform: translateY(-20px);
          }
          100% {
            transform: translateY(-250px);
            opacity: 0;
          }
        }
      `}</style>

      {/* Left Thin Sidebar (Desktop only) */}
      <div className="w-[60px] slm:hidden bg-bg-sidebar border-r border-bd-filed-form-color flex flex-col items-center py-6 gap-6 shrink-0 z-20">
        {/* Episode list icon */}
        <Button 
          onClick={() => setIsEpisodesOpen(prev => !prev)}
          className={`p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all relative group ${isEpisodesOpen ? "text-[var(--primary-color)] bg-[var(--primary-color)]/10" : "text-secondary"}`}
          title="Danh sách tập"
        >
          <RiListUnordered className="w-5 h-5" />
          <span className="absolute left-[70px] bg-bg-sidebar border border-bd-filed-form-color px-2 py-1 rounded text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-[1002]">
            Danh sách tập
          </span>
        </Button>

        {/* Chat toggle icon */}
        <Button 
          onClick={() => setIsChatOpen(prev => !prev)}
          className={`p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all relative group ${isChatOpen ? "text-[var(--primary-color)] bg-[var(--primary-color)]/10" : "text-secondary"}`}
          title="Trò chuyện"
        >
          <RiChat3Line className="w-5 h-5" />
          <span className="absolute left-[70px] bg-bg-sidebar border border-bd-filed-form-color px-2 py-1 rounded text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-[1002]">
            Khung chat
          </span>
        </Button>

        {/* Members toggle icon */}
        <Button 
          onClick={() => setIsMembersModalOpen(true)}
          className={`p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all relative group ${isMembersModalOpen ? "text-[var(--primary-color)] bg-[var(--primary-color)]/10" : "text-secondary"}`}
          title="Thành viên"
        >
          <RiGroupLine className="w-5 h-5" />
          <span className="absolute left-[70px] bg-bg-sidebar border border-bd-filed-form-color px-2 py-1 rounded text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-[1002]">
            Thành viên
          </span>
        </Button>

        {/* Info toggle icon */}
        <Button 
          onClick={() => setIsInfoModalOpen(true)}
          className={`p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all relative group ${isInfoModalOpen ? "text-[var(--primary-color)] bg-[var(--primary-color)]/10" : "text-secondary"}`}
          title="Thông tin phim"
        >
          <RiInformationLine className="w-5 h-5" />
          <span className="absolute left-[70px] bg-bg-sidebar border border-bd-filed-form-color px-2 py-1 rounded text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-[1002]">
            Thông tin phim
          </span>
        </Button>
      </div>


      {/* Collapsible Episode List Drawer (Desktop only) */}
      <AnimatePresence>
        {isEpisodesOpen && (
          <motion.div 
            initial={{ x: "-100%", opacity: 0, zIndex: 1 }}
            animate={{ x: 0, opacity: 1, zIndex: 999 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute left-[60px] top-0 bottom-0 w-[300px] bg-bg-sidebar border-r border-bd-filed-form-color z-[999] shadow-2xl flex flex-col slm:hidden"
          >
            <div className="p-4 border-b border-bd-filed-form-color flex justify-between items-center bg-bg-layer shrink-0">
              <h3 className="font-bold text-sm text-primary">Danh Sách Tập Phim</h3>
              <button 
                onClick={() => setIsEpisodesOpen(false)}
                className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10 text-secondary hover:text-primary transition-all"
              >
                <RiCloseLargeFill className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto relative">
              <EpisodesPlayer dataEpisodes={dataEpisodes} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area (Video + Details or Mobile Tabs) */}
      <div className="relative flex-1 h-full bg-black flex flex-col min-h-0 overflow-hidden">
        
        {/* Video Container (Edge-to-edge aspect-video) */}
        <div className="relative w-full aspect-video bg-black shrink-0">
          <Player data={roomData.filmData} isWatchParty={true} isChatOpen={isChatOpen} isHost={isHost} />

          {/* Floating Reactions Overlay */}
          <div className="absolute inset-x-0 bottom-16 top-[60%] pointer-events-none z-[999] overflow-hidden">
            {reactions.map((r) => (
              <div 
                key={r.id}
                className="absolute bottom-0 animate-float-up opacity-0 pointer-events-none"
                style={{ 
                  left: `${r.left}%`,
                  animation: `floatUp ${r.duration}s ease-out forwards`
                }}
              >
                <span 
                  className="block select-none"
                  style={{ 
                    fontSize: `${r.size}px`,
                    transform: `rotate(${r.rotation}deg)`
                  }}
                >
                  {r.emoji}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile View: Sticky Tab Bar & Content underneath the video */}
        <div className="flex-1 min-h-0 flex flex-col bg-bg-layout md:hidden">
          {/* Tab Bar */}
          <div className="flex justify-around bg-bg-sidebar border-b border-bd-filed-form-color h-[45px] items-center shrink-0 select-none">
            {["info", "episodes", "chat"].map((tab) => {
              const label = tab === "info" ? "Phim" : tab === "episodes" ? "Tập" : "Chat";
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`h-full px-4 text-xs font-semibold relative transition-colors ${
                    activeTab === tab ? "text-[var(--primary-color)]" : "text-secondary"
                  }`}
                >
                  {label}
                  {activeTab === tab && (
                    <motion.div 
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 inset-x-0 h-0.5 bg-[var(--primary-color)]" 
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content Area */}
          <div className="flex-1 relative">
            <AnimatePresence mode="wait">
              {activeTab === "info" && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="p-4 flex flex-col gap-4 select-text"
                >
                  <div>
                    <span className="text-[10px] font-semibold text-hover tracking-wider uppercase">ĐANG XEM CHIẾU CHUNG</span>
                    <h2 className="text-base font-bold mt-0.5 text-primary">{roomData.filmData?.movie?.name}</h2>
                    <p className="text-xs text-secondary mt-0.5">{dataEpisodes[currentEpisode]?.name || "Tập 1"}</p>
                  </div>
                  
                  <div className="flex gap-2 items-center select-none">
                    <div className="bg-bg-field border border-bd-filed-form-color px-2.5 py-1 rounded flex items-center gap-1 text-[11px] text-secondary">
                      <span>❤️</span>
                      <span className="font-semibold text-primary">2</span>
                    </div>
                    <div className="bg-bg-field border border-bd-filed-form-color px-2.5 py-1 rounded flex items-center gap-1 text-[11px] text-secondary">
                      <span>😂</span>
                      <span className="font-semibold text-primary">1</span>
                    </div>
                  </div>

                  <div className="border-t border-bd-filed-form-color pt-3">
                    <h4 className="font-bold text-xs mb-1 text-primary">Nội dung phim</h4>
                    <p className="text-[11px] text-secondary whitespace-pre-line">{roomData.filmData?.movie?.content || "Không có mô tả"}</p>
                  </div>
                </motion.div>
              )}

              {activeTab === "episodes" && (
                <motion.div
                  key="episodes"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="relative h-full"
                >
                  <EpisodesPlayer dataEpisodes={dataEpisodes} />
                </motion.div>
              )}

              {activeTab === "chat" && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="relative flex flex-col h-full"
                >
                  <ChatPanel
                    roomId={roomId}
                    messages={messages}
                    members={members}
                    memberMap={memberMap}
                    isHost={isHost}
                    hostId={roomData.hostId}
                    user={user}
                    filmData={roomData.filmData}
                    isChatOpen={true}
                    isMobile={true}
                    chatWidth="100%"
                    setIsChatOpen={() => {}}
                    onCopyLink={handleCopyLink}
                    onDestroyRoom={handleDestroyRoom}
                    onKick={handleKickMember}
                    onTransferHost={handleTransferHost}
                    onLeaveRoom={handleLeaveRoom}
                    onSendReaction={handleSendReaction}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* Resize Bar (Only for desktop when chat is open) */}
      {isChatOpen && (
        <div 
          className="w-[8px] slm:hidden cursor-col-resize hover:bg-[var(--primary-color)] transition-colors z-[100] bg-black/20 dark:bg-white/5 relative flex items-center justify-center shrink-0"
          onMouseDown={() => setIsDragging(true)}
        >
           <div className="flex flex-col gap-1 opacity-50 pointer-events-none">
              <div className="w-[1.5px] h-1.5 bg-gray-400 rounded-full"></div>
              <div className="w-[1.5px] h-1.5 bg-gray-400 rounded-full"></div>
              <div className="w-[1.5px] h-1.5 bg-gray-400 rounded-full"></div>
           </div>
        </div>
      )}

      {/* Desktop View: Chat Section */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: chatWidth, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="slm:hidden flex flex-col border-l border-bd-filed-form-color h-full shrink-0 overflow-hidden"
          >
            <ChatPanel
              roomId={roomId}
              messages={messages}
              members={members}
              memberMap={memberMap}
              isHost={isHost}
              hostId={roomData.hostId}
              user={user}
              filmData={roomData.filmData}
              isChatOpen={isChatOpen}
              isMobile={false}
              chatWidth={chatWidth}
              setIsChatOpen={setIsChatOpen}
              onCopyLink={handleCopyLink}
              onDestroyRoom={handleDestroyRoom}
              onKick={handleKickMember}
              onTransferHost={handleTransferHost}
              onLeaveRoom={handleLeaveRoom}
              onSendReaction={handleSendReaction}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Restore Chat Button (Floating on Video player for Desktop) */}
      {!isChatOpen && (
        <button 
          onClick={() => setIsChatOpen(true)}
          className="fixed top-1/2 right-0 -translate-y-1/2 z-[10000] bg-bg-layer border border-r-0 border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] text-gray-300 hover:text-white px-2 py-6 rounded-l-xl shadow-[0_0_20px_rgba(0,0,0,0.8)] flex flex-col items-center gap-3 transition-all slm:hidden"
          title="Mở Chat"
        >
          <RiSendPlane2Fill className="w-5 h-5 -rotate-45" />
          <span className="text-[11px] font-semibold tracking-wider uppercase [writing-mode:vertical-lr]">Trò chuyện</span>
        </button>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Content Info Modal */}
      <ContentModal
        content={roomData.filmData?.movie?.content || "Chưa có mô tả chi tiết."}
        isShowModal={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />

      {/* Members List Modal */}
      <AnimatePresence>
        {isMembersModalOpen && (
          <Modal onClose={() => setIsMembersModalOpen(false)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-bg-sidebar border border-bd-filed-form-color w-[400px] max-w-[90vw] rounded-2xl shadow-2xl p-4 overflow-hidden relative flex flex-col max-h-[80vh]"
            >
              <div className="flex justify-between items-center pb-3 border-b border-bd-filed-form-color mb-3">
                <h3 className="font-bold text-base text-primary flex items-center gap-2">
                  <RiGroupLine className="w-5 h-5 text-[var(--primary-color)]" />
                  Thành viên trong phòng
                </h3>
                <Button 
                  onClick={() => setIsMembersModalOpen(false)}
                  rounded
                  className="p-1 hover:bg-black/5 dark:hover:bg-white/10 text-secondary hover:text-primary transition-colors"
                >
                  <RiCloseLargeFill className="w-4 h-4" />
                </Button>
              </div>

              <div className="overflow-y-auto pr-1">
                <MemberList 
                  members={members} 
                  isHost={isHost} 
                  hostId={roomData.hostId} 
                  user={user} 
                  onKick={handleKickMember} 
                  onTransferHost={handleTransferHost} 
                />
              </div>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  </div>
  );
}
