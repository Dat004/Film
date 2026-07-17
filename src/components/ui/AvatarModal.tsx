'use client';

import { Check } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import compareImages from 'resemblejs/compareImages';

import Button from '@/components/ui/Button';
import data from '@/constants';
import { logger } from '@/lib/logger';

import { Dialog, DialogContent, DialogTitle } from './Dialog';
import FlexContainer from './FlexContainer';
import FlexItems from './FlexItems';
import Image from './Image';

export interface AvatarModalProps {
  currentImg?: string;
  onClose?: () => void;
  isShowModal?: boolean;
  handleSelectAvt?: (avtBase64: string | ArrayBuffer | null) => void;
}

const AvatarModal: React.FC<AvatarModalProps> = ({
  currentImg = '',
  onClose = () => {},
  isShowModal = false,
  handleSelectAvt = () => {},
}) => {
  const [id, setId] = useState<number | null>(null);

  useEffect(() => {
    if (!currentImg || currentImg.startsWith('https://lh3')) return;

    (async () => {
      for (let i = 0; i < data.dataAvatar.length; i++) {
        const item = data.dataAvatar[i];
        if (!item) continue;
        const imgUrl = (item as { src?: string }).src || item;
        const compareImg = await compareImages(currentImg, imgUrl as string);

        if (compareImg.rawMisMatchPercentage === 0) {
          setId(i);
          break;
        }
      }
    })();
  }, [currentImg]);

  const handleCreateImageBlobURL = async (url: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const base64String = await convertImageToBase64(blob);
      handleSelectAvt(base64String);
    } catch (e) {
      logger.error('Failed to fetch avatar image', e instanceof Error ? e : new Error(String(e)));
    }
  };

  async function convertImageToBase64(file: Blob): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return (
    <Dialog open={isShowModal} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="modal-panel-surface mx-auto w-[500px] mdm:w-[85%] kdm:w-[90%] p-[30px] rounded-[10px] bg-bg-sidebar border border-bd-filed-form-color">
        <header className="mb-[20px]">
          <DialogTitle className="text-primary text-center text-[20px] font-bold">
            Choose Avatar
          </DialogTitle>
        </header>
        <section>
          <FlexContainer className="!gap-y-[20px]" isWrap>
            {data.dataAvatar.map((avt: unknown, index: number) => {
              const imgUrl = (avt as { src?: string })?.src || avt;
              return (
                <FlexItems
                  onClick={() => handleCreateImageBlobURL(imgUrl as string)}
                  className={`w-[25%] ssm:w-[calc(100%/3)] px-[10px] ${
                    id === index ? 'scale-100 opacity-100' : 'scale-[0.8] opacity-30'
                  } transition-all duration-[250ms] hover:opacity-100 hover:scale-100 flex-grow-0 flex-shrink-0`}
                  key={index}
                >
                  <div className="relative">
                    <div className="cursor-pointer">
                      <Image className="rounded-[50%]" src={avt as string} cover />
                    </div>
                    {id === index && (
                      <div className="absolute top-0 right-0 size-[30px]">
                        <div className="flex justify-center items-center w-[100%] size-[100%] rounded-[50%] bg-bg-white">
                          <i className="text-[18px] text-dark flex items-center justify-center">
                            <Check />
                          </i>
                        </div>
                      </div>
                    )}
                  </div>
                </FlexItems>
              );
            })}
          </FlexContainer>
        </section>
        <footer className="mt-[20px]">
          <Button
            primary
            onClick={onClose}
            className="w-[100%] py-[12px] text-[14px] leading-[1.25] text-primary font-semibold"
          >
            Close
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarModal;
