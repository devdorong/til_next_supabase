'use client';
import { ImageIcon, XIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePostEditorModal } from '@/stores/postEditorModalStore';
import { useEffect, useRef, useState } from 'react';
import { useCreatePost } from '@/hooks/post/useCreatePost';
import { error } from 'console';
import { toast } from 'sonner';
import { Carousel, CarouselContent, CarouselItem } from '../ui/carousel';
import Image from 'next/image';

type ImageFile = {
  file: File;
  previewUrl: string;
};

export default function PostEditorModal() {
  const { isOpen, close } = usePostEditorModal();
  // 글등록 mutation 을 사용함
  const { mutate: createPost, isPending: isCreatePostPending } = useCreatePost({
    onSuccess: () => {
      toast.success('포스트 생성에 성공했습니다.', { position: 'top-center' });
      close();
    },
    onError: error => {
      toast.error('포스트 생성에 실패했습니다.', { position: 'top-center' });
    },
  });

  // post 에 저장할 내용
  const [content, setContent] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 이미지 Input 태그 참조
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 이미지 미리보기 내용들
  const [images, setImages] = useState<ImageFile[]>([]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  // 자동 포커스 및 내용 초기화
  useEffect(() => {
    if (!isOpen) return;
    textareaRef.current?.focus();
    setContent('');
    setImages([]);
  }, [isOpen]);

  // 실제 포스트 등록하기
  const handleCreatePost = () => {
    if (content.trim() === '') return;
    createPost(content);
  };
  // 이미지들이 선택되었을 때 실행할 핸들러
  const handleSelectImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        setImages(prev => [
          ...prev,
          { file, previewUrl: URL.createObjectURL(file) },
        ]);
      });
    }
    // 초기화 적용
    e.target.value = '';
  };

  // 이미지가 제거될 때 실행될 핸들러
  const handleDeleteImage = (img: ImageFile) => {
    setImages(prevImg =>
      prevImg.filter(item => item.previewUrl !== img.previewUrl)
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className='max-h-[90vh]'>
        <DialogTitle>포스트 작성</DialogTitle>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={e => setContent(e.target.value)}
          className='max-h-125 min-h-25 focus:outline-none'
          placeholder='새로운 글을 등록해주세요'
          disabled={isCreatePostPending}
        />
        {/* 이미지 선택 Input 태그 숨김 */}
        <input
          onChange={handleSelectImages}
          ref={fileInputRef}
          type='file'
          accept='image/*'
          multiple
          className='hidden'
        />

        {/* 이미지 미리보기 슬라이드 */}
        {images.length > 0 && (
          <Carousel>
            <CarouselContent>
              {images.map((img, index) => (
                <CarouselItem key={index} className='basis-2/5 '>
                  {/* 삭제 아이콘 및 기능 추가 */}
                  <div className='relative w-full h-48'>
                    <Image
                      src={img.previewUrl}
                      alt='이미지 미리보기'
                      className='rounded-sm object-cover'
                      fill
                      unoptimized
                    />
                    <div
                      onClick={() => handleDeleteImage(img)}
                      className='absolute top-0 right-0 m-1 cursor-pointer rounded-full bg-black/30 p-1'
                    >
                      <XIcon className='w-4 h-4 text-white' />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        )}

        <Button variant='outline' onClick={() => fileInputRef.current?.click()}>
          <ImageIcon /> 이미지 추가
        </Button>
        <Button onClick={handleCreatePost} disabled={isCreatePostPending}>
          저장
        </Button>
        {/* <Button>닫기</Button> */}
      </DialogContent>
    </Dialog>
  );
}
