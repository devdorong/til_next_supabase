# Post 등록하기 (글자)

## 1. 글등록 API 작성하기

- `/src/apis/post.ts 파일` 생성

```ts
// 글등록
export async function createPost(content: string) {
  const { data, error } = await supabase.from('posts').insert({ content });
  if (error) throw error;
  return data;
}
```

## 2. hook 생성하기

- Mutation 들을 정리하자.
- `/src/hooks/auth 폴더` 생성 및 관련 파일 이동
- `/src/hooks/mutations/post 폴더` 생성
- `/src/hooks/mutations/post/useCreatePost.ts 파일` 생성

```ts
import { createPost } from '@/apis/post';
import { UseMutationCallback } from '@/types/types';
import { useMutation } from '@tanstack/react-query';

export function useCreatePost(callback?: UseMutationCallback) {
  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      if (callback?.onSuccess) callback.onSuccess();
    },
    onError: error => {
      if (callback?.onError) callback.onError(error);
    },
  });
}
```

## 3. 적용하기

- `/src/components/modal/PostEditorModal.tsx` 적용
- 단계 1. mutation 적용

```tsx
// 글등록 mutation 을 사용함
const { mutate: createPost, isPending: isCreatePostPending } = useCreatePost({
  onSuccess: () => {
    close();
  },
  onError: error => {
    toast.error('포스트 생성에 실패했습니다.', { position: 'top-center' });
  },
});
```

- 2 단계.

```tsx
// 실제 포스트 등록하기
const handleCreatePost = () => {
  if (content.trim() === '') return;
  createPost(content);
};
```

- 3 단계.

```tsx
'use client';
import { ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePostEditorModal } from '@/stores/postEditorModalStore';
import { useEffect, useRef, useState } from 'react';
import { useCreatePost } from '@/hooks/post/useCreatePost';
import { error } from 'console';
import { toast } from 'sonner';

export default function PostEditorModal() {
  const { isOpen, close } = usePostEditorModal();
  // 글등록 mutation 을 사용함
  const { mutate: createPost, isPending: isCreatePostPending } = useCreatePost({
    onSuccess: () => {
      close();
    },
    onError: error => {
      toast.error('포스트 생성에 실패했습니다.', { position: 'top-center' });
    },
  });

  // post 에 저장할 내용
  const [content, setContent] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  // 자동 포커스
  useEffect(() => {
    if (!isOpen) return;
    textareaRef.current?.focus();
    setContent('');
  }, [isOpen]);

  // 실제 포스트 등록하기
  const handleCreatePost = () => {
    if (content.trim() === '') return;
    createPost(content);
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
        <Button variant='outline'>
          <ImageIcon /> 이미지 추가
        </Button>
        <Button onClick={handleCreatePost} disabled={isCreatePostPending}>
          저장
        </Button>
        <Button>닫기</Button>
      </DialogContent>
    </Dialog>
  );
}
```
