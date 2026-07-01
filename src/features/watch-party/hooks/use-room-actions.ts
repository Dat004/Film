import { destroyRoom, kickMember, transferHost, sendReaction } from "@/features/watch-party/services/watch-party-service";
import { toast } from "sonner";

interface RoomActionOptions {
  roomId: string;
  user: any;
  isHost: boolean;
  members: any[];
  router: any;
  setConfirmModal: (modal: any) => void;
}

export function useRoomActions({
  roomId,
  user,
  isHost,
  members,
  router,
  setConfirmModal,
}: RoomActionOptions) {
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
          router.push("/watch-party");
        } catch (err) {
          toast.error("Lỗi khi hủy phòng!");
        }
      },
    });
  };

  const handleSendReaction = async (emoji: string) => {
    try {
      await sendReaction(roomId, user, emoji);
    } catch (err) {
      console.error("Lỗi khi gửi emoji:", err);
    }
  };

  const handleLeaveRoom = () => {
    const confirmMessage =
      isHost && members.length > 1
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
        router.push("/watch-party");
      },
    });
  };

  const handleKickMember = (memberId: string, displayName: string) => {
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
          toast.success(`Đã mời ${displayName || "Ẩn danh"} ra khỏi phòng.`);
        } catch (err) {
          toast.error("Lỗi khi mời thành viên!");
        }
      },
    });
  };

  const handleTransferHost = (memberId: string, displayName: string) => {
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
          toast.success(`Đã chuyển quyền chủ phòng cho ${displayName || "Ẩn danh"}.`);
        } catch (err) {
          toast.error("Lỗi khi chuyển quyền!");
        }
      },
    });
  };

  return {
    handleDestroyRoom,
    handleSendReaction,
    handleLeaveRoom,
    handleKickMember,
    handleTransferHost,
  };
}
