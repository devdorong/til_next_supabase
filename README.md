# 포스트 수정하기

- `/src/components/post/PostItem.tsx`
- 수정 버튼 부분을 별도로 컴포넌트로 분리
- `/src/components/post/EditPostItemButton.tsx 파일` 생성

```tsx
import { Button } from '@/components/ui/button';

export default function EditPostItemButton() {
  return (
    <Button className='cursor-pointer' variant={'ghost'}>
      수정
    </Button>
  );
}
```

- `src\components\post\PostItem.tsx` 업데이트

```tsx
{
  /* 1-2. 수정/삭제 버튼 */
}
<div className='text-muted-foreground flex text-sm'>
  <EditPostItemButton />
  <Button className='cursor-pointer' variant={'ghost'}>
    삭제
  </Button>
</div>;
```

## 1. 수정 기능 적용하기

### 1.1. 기본 에디터 모달의 문제점

- ADD, EDIT 구분필요

```tsx
'use client';
import { Button } from '@/components/ui/button';
import { useOpenPostEditorModal } from '@/stores/postEditorModalStore';

export default function EditPostItemButton() {
  const openPostEditorModal = useOpenPostEditorModal();
  const handleClick = () => {
    // 추가인지, 편집인지 구분이 필요함.
    openPostEditorModal();
  };
  return (
    <Button onClick={handleClick} className='cursor-pointer' variant={'ghost'}>
      수정
    </Button>
  );
}
```

### 1.2. 매개변수로 편집인지, 추가인지 구분

- 필요로한 에디터 모달에 전달할 데이터 모양을 고려.

```tsx
const handleClick = () => {
  // 추가인지, 편집인지 구분이 필요함.
  openPostEditorModal({
    type: 'EDIT',
    postId: 100,
    content: '수정할 내용',
    imageUrls: ['...'],
  });
};
```

### 1.3. 실제 데이터 Props 로 전달해 보자.

- `/src/components/post/PostItem.tsx`

```tsx
<div className='text-muted-foreground flex text-sm'>
  <EditPostItemButton {...post} />
  <Button className='cursor-pointer' variant={'ghost'}>
    삭제
  </Button>
</div>
```

- `/src/components/post/EditPostItemButton.tsx`

```tsx
'use client';
import { Button } from '@/components/ui/button';
import { useOpenPostEditorModal } from '@/stores/postEditorModalStore';
import { PostEntity } from '@/types/types';

export default function EditPostItemButton(props: PostEntity) {
  const openPostEditorModal = useOpenPostEditorModal();
  const handleClick = () => {
    // 추가인지, 편집인지 구분이 필요함.
    openPostEditorModal({
      type: 'EDIT',
      postId: props.id,
      content: props.content,
      imageUrls: props.image_urls,
    });
  };
  return (
    <Button onClick={handleClick} className='cursor-pointer' variant={'ghost'}>
      수정
    </Button>
  );
}
```

## 2. Store 변경하기

- `postEditorModalStore.ts`

```ts
// 새 포스트 등록 타입
type CreateMode = {
  isOpen: true;
  type: 'CREATE';
};
// 포스트 편집 타입
type EditMode = {
  isOpen: true;
  type: 'EDIT';
  // 초기 설정값의 타입
  postId: number;
  content: string;
  imageUrls: string[] | null;
};

// 모달이 Opem 인 경우 타입
type OpenState = CreateMode | EditMode;
// 모달이 Close 인 경우 타입
type CloseState = {
  isOpen: false;
};

type State = CloseState | OpenState;

const initialState = {
  isOpen: false,
} as State;
```

- usePostEditorStore 변경

```ts
const usePostEditorStore = create(
  devtools(
    combine(initialState, set => ({
      actions: {
        openCreate: () => {
          set({ isOpen: true, type: 'CREATE' });
        },
        openEdit: (params: Omit<EditMode, 'isOpen' | 'type'>) => {
          // 코드 보시기 좋으시라고
          set({ isOpen: true, type: 'EDIT', ...params });
        },
        close: () => {
          set({ isOpen: false });
        },
      },
    })),
    { name: 'PostEditorStore' }
  )
);
```

- 커스텀 훅 변경

```ts
export const useOpenCreatePostEditorModal = () => {
  const openCreate = usePostEditorStore(store => store.actions.openCreate);
  return openCreate;
};
export const useOpenEditPostEditorModal = () => {
  const openEdit = usePostEditorStore(store => store.actions.openEdit);
  return openEdit;
};
```

- 전체코드

```ts
import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';

// 새 포스트 등록 타입
type CreateMode = {
  isOpen: true;
  type: 'CREATE';
};
// 포스트 편집 타입
type EditMode = {
  isOpen: true;
  type: 'EDIT';
  // 초기 설정값의 타입
  postId: number;
  content: string;
  imageUrls: string[] | null;
};

// 모달이 Opem 인 경우 타입
type OpenState = CreateMode | EditMode;
// 모달이 Close 인 경우 타입
type CloseState = {
  isOpen: false;
};

type State = CloseState | OpenState;

const initialState = {
  isOpen: false,
} as State;

// 단계가 중요함.
// 미들웨어와 겹침을 주의하자.
// Store 는 state 와 action 이 있다.
const usePostEditorStore = create(
  devtools(
    combine(initialState, set => ({
      actions: {
        openCreate: () => {
          set({ isOpen: true, type: 'CREATE' });
        },
        openEdit: (params: Omit<EditMode, 'isOpen' | 'type'>) => {
          // 코드 보시기 좋으시라고
          set({ isOpen: true, type: 'EDIT', ...params });
        },
        close: () => {
          set({ isOpen: false });
        },
      },
    })),
    { name: 'PostEditorStore' }
  )
);

// 오로지 store 의 actions 의 open 만 가져감
// export const useOpenPostEditorModal = () => {
//   const open = usePostEditorStore(store => store.actions.open);
//   return open;
// };
export const useOpenCreatePostEditorModal = () => {
  const openCreate = usePostEditorStore(store => store.actions.openCreate);
  return openCreate;
};
export const useOpenEditPostEditorModal = () => {
  const openEdit = usePostEditorStore(store => store.actions.openEdit);
  return openEdit;
};

// 오로지 store 의 actions 의 close 만 가져감
export const useClosePostEditorModal = () => {
  const close = usePostEditorStore(store => store.actions.close);
  return close;
};
// 미리 store 전체 내보내기
export const usePostEditorModal = () => {
  // const {
  //   isOpen,
  //   actions: { close, openCreate, openEdit },
  // } = usePostEditorStore();
  // return { isOpen, close, open };
  const store = usePostEditorStore();
  return store as typeof store & State;
};
```

## 3. hook 변경 사항 적용하기

- `src\components\post\CreatePostButton.tsx` 변경

```tsx
'use client';
import { useOpenCreatePostEditorModal } from '@/stores/postEditorModalStore';
import { PlusCircle } from 'lucide-react';

export function CreatePostButton() {
  const openPostEditorModal = useOpenCreatePostEditorModal();
  return (
    <div
      onClick={openPostEditorModal}
      className='bg-muted text-muted-foreground cursor-pointer rounded-xl px-6 py-4'
    >
      <div className='flex items-center justify-between'>
        <div>새글을 등록하세요.</div>
        <PlusCircle className='h-5 w-5' />
      </div>
    </div>
  );
}
```

- `src\components\post\EditPostItemButton.tsx` 변경

```tsx
'use client';
import { Button } from '@/components/ui/button';
import { useOpenEditPostEditorModal } from '@/stores/postEditorModalStore';
import { PostEntity } from '@/types/types';

export default function EditPostItemButton(props: PostEntity) {
  const openPostEditorModal = useOpenEditPostEditorModal();
  const handleClick = () => {
    // 추가인지, 편집인지 구분이 필요함.
    openPostEditorModal({
      postId: props.id,
      content: props.content,
      imageUrls: props.image_urls,
    });
  };
  return (
    <Button onClick={handleClick} className='cursor-pointer' variant={'ghost'}>
      수정
    </Button>
  );
}
```

## 4. 모달 변경 사항 적용하기

- `/src/components/modal/PostEditorModal.tsx`
- 추후 본인이 추가적인 기능을 업데이트 시 아래코드에서 `postEditorModalStore` 검색으로 확인.

```tsx
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
import { useSession } from '@/stores/session';
import { useOpenAlertModal } from '@/stores/alertModalStore';

type ImageFile = {
  file: File;
  previewUrl: string;
};

export default function PostEditorModal() {
  // 사용자 정보 받아오기
  const session = useSession();

  // 경고장
  const openAlertModal = useOpenAlertModal();

  const postEditorModalStore = usePostEditorModal();
  // 글등록 mutation 을 사용함
  const { mutate: createPost, isPending: isCreatePostPending } = useCreatePost({
    onSuccess: () => {
      toast.success('포스트 생성에 성공했습니다.', { position: 'top-center' });
      postEditorModalStore.actions.close();
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
    if (!postEditorModalStore.isOpen) {
      images.forEach(img => {
        URL.revokeObjectURL(img.previewUrl);
      });
      return;
    }
    if (postEditorModalStore.type === 'CREATE') {
      setContent('');
      setImages([]);
    } else {
      setContent(postEditorModalStore.content);
      setImages([]);
    }
    textareaRef.current?.focus();
  }, [postEditorModalStore.isOpen]);

  // 실제 포스트 등록하기
  const handleCreatePost = () => {
    if (content.trim() === '') return;
    createPost({
      content,
      userId: session!.user.id,
      // 파일만 추출해 주기
      images: images.map(item => item.file),
    });
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
    // 웹브라우저 캐시 메모리 지우기
    URL.revokeObjectURL(img.previewUrl);
  };

  const handleCloseModal = () => {
    if (content !== '' || images.length !== 0) {
      // 안내창을 띄워서 확인후 닫기 실행처리
      openAlertModal({
        title: '포스트 작성이 완료되지 않았습니다.',
        description: '화면에서 나가면 작성중이던 내용이 사라집니다.',
        onPositive: () => {
          postEditorModalStore.actions.close();
        },
        onNegative: () => {
          console.log('취소 클릭');
        },
      });
      return;
    }

    postEditorModalStore.actions.close(); // 방지해보자
  };

  return (
    <Dialog open={postEditorModalStore.isOpen} onOpenChange={handleCloseModal}>
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

        {/* 편집모드 일때 보여지는 부분 */}
        {postEditorModalStore.isOpen &&
          postEditorModalStore.type === 'EDIT' && (
            <>
              <Carousel>
                <CarouselContent>
                  {postEditorModalStore.imageUrls?.map(url => (
                    <CarouselItem key={url} className='basis-2/5 '>
                      {/* 삭제 아이콘 및 기능 추가 */}
                      <div className='relative w-full h-48'>
                        <Image
                          src={url}
                          alt='이미지 미리보기'
                          className='rounded-sm object-cover'
                          fill
                          unoptimized
                        />
                        {/* <div
                          onClick={() => handleDeleteImage(url)}
                          className='absolute top-0 right-0 m-1 cursor-pointer rounded-full bg-black/30 p-1'
                        >
                          <XIcon className='w-4 h-4 text-white' />
                        </div> */}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </>
          )}

        {/* 포스트 생성시 활용 */}
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
        {/* 편집 상태에서는 이미지 추가 안함 */}
        {postEditorModalStore.isOpen &&
          postEditorModalStore.type === 'CREATE' && (
            <Button
              variant='outline'
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon /> 이미지 추가
            </Button>
          )}
        <Button onClick={handleCreatePost} disabled={isCreatePostPending}>
          저장
        </Button>
        {/* <Button>닫기</Button> */}
      </DialogContent>
    </Dialog>
  );
}
```

## 5. 수정 API 추가하기

- `/src/apis/post.ts` 추가
- 기존의 API 재활용 가능함.
- 새글등록 > 포스트등록 > 파일등록 > `포스트 업데이트` 구현함

```ts
// 3. 이미지 여러개 등록 이후에 포스트 업데이트 함수

export async function updatePost(post: UpdatePostEntity & { id: number }) {
  const { data, error } = await supabase
    .from('posts')
    .update(post)
    .eq('id', post.id)
    .select('*')
    .single();
  if (error) throw error;

  return data;
}
```

## 6. update 용 Hook 추가하기

- `/src/hooks/mutations/post/useUpdatePost.ts 파일` 생성

```ts
import { useMutation } from '@tanstack/react-query';
import { updatePost } from '@/apis/post';
import { UseMutationCallback } from '@/types/types';

export function useUpdatePost(callback?: UseMutationCallback) {
  return useMutation({
    mutationFn: updatePost,
    onSuccess: () => {
      if (callback?.onSuccess) callback.onSuccess();
    },
    onError: error => {
      if (callback?.onError) callback.onError(error);
    },
  });
}
```

## 7. 적용

- `/src/components/modal/PostEditorModal.tsx` 업데이트

- 단계 1.

```tsx
// 글수정 mutation 을 사용함
const { mutate: updatePost, isPending: isUpdatePostPending } = useUpdatePost({
  onSuccess: () => {
    toast.success('포스트 수정에 성공했습니다.', { position: 'top-center' });
    postEditorModalStore.actions.close();
  },
  onError: error => {
    toast.error('포스트 생성에 실패했습니다.', { position: 'top-center' });
  },
});
```

- 단계 2.

```tsx
const handleSavePost = () => {
  if (content.trim() === '') return;
  if (!postEditorModalStore.isOpen) return;
  if (postEditorModalStore.type === 'CREATE') {
    createPost({
      content,
      userId: session!.user.id,
      // 파일만 추출해 주기
      images: images.map(item => item.file),
    });
  } else {
    // 수정 상태
    if (content === postEditorModalStore.content) return;
    updatePost({
      id: postEditorModalStore.postId,
      content,
    });
  }
};
```

- 단계 3.

```tsx
<Button onClick={handleSavePost} disabled={isCreatePostPending}>
  저장
</Button>
```

- 4 단계 : 로딩창 적용하기
- 새글 등록중이거나 수정중일때 처리가 필요함.

```tsx
// 글 수정 또는 새글 작성시 로딩 처리
const isPending = isCreatePostPending || isUpdatePostPending;
```

- 테스트 하기

## 8. 전체 코드

```tsx
'use client';
import { ImageIcon, XIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePostEditorModal } from '@/stores/postEditorModalStore';
import { useEffect, useRef, useState } from 'react';
import { useCreatePost } from '@/hooks/mutations/post/useCreatePost';
import { error } from 'console';
import { toast } from 'sonner';
import { Carousel, CarouselContent, CarouselItem } from '../ui/carousel';
import Image from 'next/image';
import { useSession } from '@/stores/session';
import { useOpenAlertModal } from '@/stores/alertModalStore';
import { useUpdatePost } from '@/hooks/mutations/post/useUpdatePost';
import Loader from '../Loader';

type ImageFile = {
  file: File;
  previewUrl: string;
};

export default function PostEditorModal() {
  // 사용자 정보 받아오기
  const session = useSession();

  // 경고장
  const openAlertModal = useOpenAlertModal();

  const postEditorModalStore = usePostEditorModal();
  // 글등록 mutation 을 사용함
  const { mutate: createPost, isPending: isCreatePostPending } = useCreatePost({
    onSuccess: () => {
      toast.success('포스트 생성에 성공했습니다.', { position: 'top-center' });
      postEditorModalStore.actions.close();
    },
    onError: error => {
      toast.error('포스트 생성에 실패했습니다.', { position: 'top-center' });
    },
  });

  // 글수정 mutation 을 사용함
  const { mutate: updatePost, isPending: isUpdatePostPending } = useUpdatePost({
    onSuccess: () => {
      toast.success('포스트 수정에 성공했습니다.', { position: 'top-center' });
      postEditorModalStore.actions.close();
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
    if (!postEditorModalStore.isOpen) {
      images.forEach(img => {
        URL.revokeObjectURL(img.previewUrl);
      });
      return;
    }
    if (postEditorModalStore.type === 'CREATE') {
      setContent('');
      setImages([]);
    } else {
      setContent(postEditorModalStore.content);
      setImages([]);
    }
    textareaRef.current?.focus();
  }, [postEditorModalStore.isOpen]);

  // 실제 포스트 등록 또는 편집하기
  // 이름만 바꿈
  // const handleCreatePost = () => {

  const handleSavePost = () => {
    if (content.trim() === '') return;
    if (!postEditorModalStore.isOpen) return;
    if (postEditorModalStore.type === 'CREATE') {
      createPost({
        content,
        userId: session!.user.id,
        // 파일만 추출해 주기
        images: images.map(item => item.file),
      });
    } else {
      // 수정 상태
      if (content === postEditorModalStore.content) return;
      updatePost({
        id: postEditorModalStore.postId,
        content,
      });
    }
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
    // 웹브라우저 캐시 메모리 지우기
    URL.revokeObjectURL(img.previewUrl);
  };

  const handleCloseModal = () => {
    if (content !== '' || images.length !== 0) {
      // 안내창을 띄워서 확인후 닫기 실행처리
      openAlertModal({
        title: '포스트 작성이 완료되지 않았습니다.',
        description: '화면에서 나가면 작성중이던 내용이 사라집니다.',
        onPositive: () => {
          postEditorModalStore.actions.close();
        },
        onNegative: () => {
          console.log('취소 클릭');
        },
      });
      return;
    }

    postEditorModalStore.actions.close(); // 방지해보자
  };

  // 글 수정 또는 새글 작성시 로딩 처리
  const isPending = isCreatePostPending || isUpdatePostPending;

  return (
    <Dialog open={postEditorModalStore.isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className='max-h-[90vh]'>
        <DialogTitle>포스트 작성</DialogTitle>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={e => setContent(e.target.value)}
          className='max-h-125 min-h-25 focus:outline-none'
          placeholder='새로운 글을 등록해주세요'
          disabled={isPending}
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

        {/* 편집모드 일때 보여지는 부분 */}
        {postEditorModalStore.isOpen &&
          postEditorModalStore.type === 'EDIT' && (
            <>
              <Carousel>
                <CarouselContent>
                  {postEditorModalStore.imageUrls?.map(url => (
                    <CarouselItem key={url} className='basis-2/5 '>
                      {/* 삭제 아이콘 및 기능 추가 */}
                      <div className='relative w-full h-48'>
                        <Image
                          src={url}
                          alt='이미지 미리보기'
                          className='rounded-sm object-cover'
                          fill
                          unoptimized
                        />
                        {/* <div
                          onClick={() => handleDeleteImage(url)}
                          className='absolute top-0 right-0 m-1 cursor-pointer rounded-full bg-black/30 p-1'
                        >
                          <XIcon className='w-4 h-4 text-white' />
                        </div> */}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </>
          )}

        {/* 포스트 생성시 활용 */}
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
        {/* 편집 상태에서는 이미지 추가 안함 */}
        {postEditorModalStore.isOpen &&
          postEditorModalStore.type === 'CREATE' && (
            <Button
              variant='outline'
              onClick={() => fileInputRef.current?.click()}
              disabled={isPending}
            >
              <ImageIcon /> 이미지 추가
            </Button>
          )}
        <Button onClick={handleSavePost} disabled={isPending}>
          저장
        </Button>
        {/* <Button>닫기</Button> */}
      </DialogContent>
    </Dialog>
  );
}
```
