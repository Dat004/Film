'use client';

import FlexContainer from '@/components/ui/FlexContainer';
import { useAuth } from '@/features/auth';
import { ContinueWatchingVideoScreen } from '@/features/film';
import { HistoryIcon } from '@/icons';

export default function ContinueWatchingPage() {
  const { continueWatching, uid } = useAuth();

  return (
    <div className="px-[15px]">
      <section className="max-w-[1000px] mx-auto">
        <FlexContainer className="items-center mb-[24px]">
          <h1 className="text-primary text-[28px] font-medium mdm:text-[20px] ccm:text-[18px]">
            Continue Watching
          </h1>
        </FlexContainer>
        <ContinueWatchingVideoScreen data={continueWatching} uid={uid || ''} />
      </section>
    </div>
  );
}
