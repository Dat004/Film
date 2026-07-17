'use client';

import { useState, useEffect } from 'react';

import Button from '@/components/ui/Button';
import FlexContainer from '@/components/ui/FlexContainer';
import FlexItems from '@/components/ui/FlexItems';
import data from '@/constants';
import { useAuth } from '@/features/auth';
import { WatchListScreen } from '@/features/film';
import { HeartIcon } from '@/icons';

export default function WatchListPage() {
  const [type, setType] = useState('all');
  const { listWatching } = useAuth();
  const [listWatchingData, setListWatchingData] = useState<any[]>([]);

  useEffect(() => {
    if (type !== 'all') {
      setListWatchingData((listWatching as any[]).filter((watchList) => watchList.title === type));
    } else {
      setListWatchingData(listWatching as any[]);
    }
  }, [type, listWatching]);

  const menu = [
    {
      title: 'All',
      type: 'all',
    },
    ...data.dataList,
  ];

  return (
    <div className="px-[15px]">
      <section className="max-w-[1000px] mx-auto">
        <FlexContainer className="items-center mb-[24px]">
          <h1 className="text-primary text-[28px] font-medium mdm:text-[20px] ccm:text-[18px]">
            Watch Playlist
          </h1>
        </FlexContainer>
        <FlexContainer isWrap className="gap-x-[10px] !gap-y-[12px] mb-[24px]">
          {menu.map((item, index) => (
            <FlexItems key={index}>
              <Button
                onClick={() => setType(item.type)}
                primary={type === item.type}
                outline={type !== item.type}
                className={`text-[14px] px-[15px] ${
                  type === item.type
                    ? 'border-[1px] border-solid border-transparent'
                    : '!border-bd-filed-form-color'
                } min-w-[90px] h-[36px] py-[10px] !font-medium`}
              >
                {item.title}
              </Button>
            </FlexItems>
          ))}
        </FlexContainer>
        <WatchListScreen isShowTitle={type === 'all'} data={listWatchingData} />
      </section>
    </div>
  );
}
