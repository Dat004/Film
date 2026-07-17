import React from 'react';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/DropdownMenu';
import { ToastMessage } from '@/components/ui/Toastify';
import data from '@/constants';
import { useAuth, LoginModal } from '@/features/auth';
import type { Film } from '@/features/film';
import { useRealtimeDbFirebase, useControlModal } from '@/hooks';
import { logger } from '@/lib/logger';

export interface ListContainerProps {
  children?: React.ReactNode;
  dataFilm?: Partial<Film> | undefined;
}

const ListContainer: React.FC<ListContainerProps> = ({ children, dataFilm = {} }) => {
  const { uid, isLogged } = useAuth();
  const { getDb, setDb } = useRealtimeDbFirebase();
  const { handleCloseModal, handleShowModal, isShowModal } = useControlModal();

  const handleAddList = async (item: { type?: string; title?: string; name?: string }) => {
    if (isLogged && uid) {
      const type = item?.type;
      const refPath = `/list_video/${uid}/${dataFilm?._id}`;
      await getDb({
        path: refPath,
        callback: async (snapShot) => {
          if (snapShot?.exists()) {
            ToastMessage.warning('Video đã có trong danh sách phát!');
          } else {
            await setDb({
              path: refPath,
              options: { ...dataFilm, type },
              messageSuccess: 'Đã thêm video vào danh sách phát!',
              messageError: 'Không thể thêm video vào danh sách phát!',
            });
          }
        },
        fallback: (err) => {
          logger.error(
            'Firebase list operation failed',
            err instanceof Error ? err : new Error(String(err))
          );
        },
      });
    } else {
      ToastMessage.warning('Vui lòng đăng nhập!');
      handleShowModal();
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {data.dataList.map(
            (item: { type?: string; title?: string; name?: string }, index: number) => (
              <DropdownMenuItem
                key={index}
                onSelect={() => handleAddList(item)}
                className="relative flex items-center px-[12px] w-[100%] h-[36px] !justify-start py-[10px] bg-transparent hover:bg-bg-menu-items leading-[1] cursor-pointer"
              >
                <span className="text-[12px] text-items font-medium">
                  {item?.title || item?.name}
                </span>
              </DropdownMenuItem>
            )
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <LoginModal isShowModal={isShowModal} onClose={handleCloseModal} />
    </>
  );
};

export default ListContainer;
