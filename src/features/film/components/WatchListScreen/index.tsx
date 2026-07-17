import { Inbox } from 'lucide-react';
import React, { Fragment } from 'react';

import HeaderContainer from '@/components/ui/Container/HeaderContainer';
import EmptyState from '@/components/ui/EmptyState';
import FlexContainer from '@/components/ui/FlexContainer';
import FlexItems from '@/components/ui/FlexItems';
import type { WatchListGroup } from '@/features/auth';

import { FILM_UI_COPY } from '../../constants/film-ui.constants';
import FilmElement from '../FilmElement';

export interface WatchListScreenProps {
  data?: WatchListGroup[];
  isShowTitle?: boolean;
}

const WatchListScreen: React.FC<WatchListScreenProps> = ({ data = [], isShowTitle = false }) => {
  const hasData = data.some((item) => item?.data?.length > 0);

  if (!hasData) {
    return (
      <EmptyState
        icon={Inbox}
        title={FILM_UI_COPY.watchListEmptyTitle}
        description={FILM_UI_COPY.watchListEmptyDescription}
      />
    );
  }

  return (
    <>
      {data.map((item, index) => (
        <Fragment key={item.title || index}>
          {isShowTitle && item.title ? (
            <HeaderContainer title={item.title.split('-').join(' ')} />
          ) : null}
          <FlexContainer className="!items-start !gap-y-[20px] mx-[-8px] pb-[24px]" isWrap>
            {item?.data?.map((value) => (
              <FlexItems
                className="w-[20%] clm:w-[25%] mdm:w-[calc(100%/3)] ccm:w-[50%] px-[8px]"
                key={value?._id}
              >
                <FilmElement data={value} variant="poster" />
              </FlexItems>
            ))}
          </FlexContainer>
        </Fragment>
      ))}
    </>
  );
};

export default WatchListScreen;
