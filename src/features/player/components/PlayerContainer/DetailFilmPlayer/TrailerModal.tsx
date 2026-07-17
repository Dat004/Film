'use client';

import { Play, X } from 'lucide-react';
import React from 'react';

import Button from '@/components/ui/Button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/Dialog';
import { extractYoutubeVideoId } from '@/lib/film-detail';

export interface TrailerModalProps {
  trailerUrl?: string | undefined;
}

const TrailerModal: React.FC<TrailerModalProps> = ({ trailerUrl }) => {
  const [open, setOpen] = React.useState(false);
  const videoId = extractYoutubeVideoId(trailerUrl);

  if (!videoId) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-[6px] rounded-[8px] border border-bd-filed-form-color bg-bg-sidebar px-[16px] py-[10px] text-[14px] font-semibold text-primary hover:bg-fill-secondary transition-colors"
      >
        <Play className="w-[16px] h-[16px]" />
        Xem Trailer
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[900px] w-[95vw] p-0 bg-black border-0">
          <DialogTitle className="sr-only">Trailer phim</DialogTitle>
          <div className="flex justify-end p-[8px]">
            <Button rounded aria-label="Đóng trailer" onClick={() => setOpen(false)}>
              <X className="text-[18px] text-white" />
            </Button>
          </div>
          <div className="relative w-full pb-[56.25%]">
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
              title="Trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TrailerModal;
