import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RiListUnordered, RiChat3Line, RiGroupLine, RiInformationLine, RiCloseLargeFill } from "react-icons/ri";
import Button from "@/components/ui/button";
import EpisodesPlayer from "@/features/player/components/episodes-player";

interface DesktopSidebarProps {
  isEpisodesOpen: boolean;
  setIsEpisodesOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isChatOpen: boolean;
  setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsMembersModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsInfoModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  dataEpisodes: any[];
}

export function DesktopSidebar({
  isEpisodesOpen,
  setIsEpisodesOpen,
  isChatOpen,
  setIsChatOpen,
  setIsMembersModalOpen,
  setIsInfoModalOpen,
  dataEpisodes,
}: DesktopSidebarProps) {
  return (
    <>
      {/* Left Thin Sidebar (Desktop only) */}
      <div className="w-[60px] slm:hidden bg-bg-sidebar border-r border-bd-filed-form-color flex flex-col items-center py-6 gap-6 shrink-0 z-20">
        <Button
          onClick={() => setIsEpisodesOpen((prev) => !prev)}
          className={`p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all relative group ${
            isEpisodesOpen ? "text-[var(--primary-color)] bg-[var(--primary-color)]/10" : "text-secondary"
          }`}
          title="Danh sách tập"
        >
          <RiListUnordered className="w-5 h-5" />
          <span className="absolute left-[70px] bg-bg-sidebar border border-bd-filed-form-color px-2 py-1 rounded text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-[1002]">
            Danh sách tập
          </span>
        </Button>

        <Button
          onClick={() => setIsChatOpen((prev: boolean) => !prev)}
          className={`p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all relative group ${
            isChatOpen ? "text-[var(--primary-color)] bg-[var(--primary-color)]/10" : "text-secondary"
          }`}
          title="Trò chuyện"
        >
          <RiChat3Line className="w-5 h-5" />
          <span className="absolute left-[70px] bg-bg-sidebar border border-bd-filed-form-color px-2 py-1 rounded text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-[1002]">
            Khung chat
          </span>
        </Button>

        <Button
          onClick={() => setIsMembersModalOpen(true)}
          className={`p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all relative group ${
            "text-secondary" // Always neutral initially, hover color is handled in class
          }`}
          title="Thành viên"
        >
          <RiGroupLine className="w-5 h-5" />
          <span className="absolute left-[70px] bg-bg-sidebar border border-bd-filed-form-color px-2 py-1 rounded text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-[1002]">
            Thành viên
          </span>
        </Button>

        <Button
          onClick={() => setIsInfoModalOpen(true)}
          className={`p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all relative group ${
            "text-secondary"
          }`}
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
    </>
  );
}
