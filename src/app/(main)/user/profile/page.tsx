'use client';

import { Edit2, User, UserMinus, Edit } from 'lucide-react';
import { useEffect, useState } from 'react';

import AvatarModal from '@/components/ui/AvatarModal';
import Button from '@/components/ui/Button';
import FlexContainer from '@/components/ui/FlexContainer';
import FlexItems from '@/components/ui/FlexItems';
import Image from '@/components/ui/Image';
import { ToastMessage } from '@/components/ui/Toastify';
import { useAuth } from '@/features/auth';
import { useControlModal } from '@/hooks';

import FieldValue from './FieldValue';

export default function ProfilePage() {
  const { user = {}, uid = '', avatar, updateProfile } = useAuth();
  const { createdAt, email, displayName, emailVerified } = user;
  const { isShowModal, handleCloseModal, handleShowModal } = useControlModal();

  const time = createdAt ? new Date(+(createdAt as string)).toLocaleDateString() : '';

  const [value, setValue] = useState<{ image: string; name: string }>({
    image: avatar || '',
    name: displayName || '',
  });

  useEffect(() => {
    setValue({ name: displayName || '', image: avatar || '' });
  }, [displayName, avatar]);

  const handleSelectAvatar = (avt: string | ArrayBuffer | null) => {
    setValue((state) => ({ ...state, image: typeof avt === 'string' ? avt : '' }));
  };

  const handleUpdateUser = async () => {
    if (!uid) return;
    if (value.name === displayName && value.image === avatar) return;

    try {
      await updateProfile(uid, {
        displayName: value.name,
        photoUrl: value.image,
      });
      ToastMessage.success('Cập nhật thông tin thành công!');
    } catch {
      ToastMessage.error('Cập nhật thông tin thất bại!');
    }
  };

  return (
    <div className="px-[15px]">
      <section className="max-w-[600px] mx-auto">
        <FlexContainer className="items-center mb-[24px]">
          <h1 className="text-primary text-[28px] font-medium mdm:text-[20px] ccm:text-[18px]">
            Profile
          </h1>
        </FlexContainer>
        <div className="profile-panel relative w-[100%] p-[30px] ccm:border-0 ccm:bg-transparent ccm:p-0 ccm:shadow-none">
          <div className="absolute w-[160px] top-0 right-0 h-[100%] slm:relative slm:w-[100%] slm:h-auto slm:flex slm:justify-center slm:items-center slm:mb-[16px]">
            <div className="absolute inset-0 bg-bg-content-area-color slm:hidden"></div>
            <div className="size-[100%] slm:size-[100px] slm:p-0 p-[30px]">
              <div onClick={handleShowModal} className="relative w-[100%] pb-[100%] cursor-pointer">
                <div className="absolute inset-0">
                  <Image className="rounded-[50%]" src={value.image} cover />
                </div>
                <Button
                  rounded
                  onClick={handleShowModal}
                  className="!absolute size-[30px] bg-bg-field text-primary bottom-0 right-0"
                >
                  <Edit className="size-[18px]" />
                </Button>
              </div>
              <AvatarModal
                currentImg={value.image}
                isShowModal={isShowModal}
                onClose={handleCloseModal}
                handleSelectAvt={handleSelectAvatar}
              />
            </div>
          </div>
          <section className="pr-[190px] slm:pr-0">
            <form action="" onSubmit={(e) => e.preventDefault()}>
              <FieldValue
                disabled
                label="Email address"
                value={email || ''}
                fieldName="email"
                type="email"
              />
              <FieldValue
                onChange={(e) => setValue((state) => ({ ...state, name: e.target.value }))}
                label="Your name"
                value={value.name || ''}
                fieldName="username"
                type="text"
              />
              <FieldValue
                disabled
                label="Joined"
                value={time || ''}
                fieldName="createdAt"
                type="text"
              />
              <div className="bg-bg-layout ccm:bg-bg-footer rounded-[8px] p-[12px]">
                <FlexContainer
                  className={`items-center mb-[4px] ${
                    !emailVerified ? 'text-title' : 'text-[var(--color-success)]'
                  }`}
                >
                  <i className="text-[18px] flex items-center justify-center">
                    {!emailVerified ? <UserMinus /> : <User />}
                  </i>
                  <FlexItems className="ml-[4px]">
                    <p className="text-[14px] font-medium">
                      {!emailVerified ? 'Not Verified' : 'Verified'}
                    </p>
                  </FlexItems>
                </FlexContainer>
                <span className="text-[14px] text-primary font-medium leading-[1.25] whitespace-normal">
                  {!emailVerified
                    ? 'Your account has not been verified.'
                    : 'Your email has been verified.'}
                </span>
              </div>
              <div className="pt-[20px]">
                <Button
                  primary
                  type="button"
                  onClick={() => void handleUpdateUser()}
                  disabled={value.name === displayName && value.image === avatar}
                  className="profile-save-btn w-[100%] rounded-[4px] hover:text-primary hover:opacity-90 !font-medium h-[42px] disabled:hover:opacity-100"
                >
                  Save
                </Button>
              </div>
            </form>
          </section>
        </div>
      </section>
    </div>
  );
}
