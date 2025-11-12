# Post 이미지 저장하기

## 1. Storage 생성

- `uploads` 저장소 생성
- Public bucket : `활성`
- Restrict file size : `5M`
- Restrict MIME types : `image/*`
- Create 버튼 클릭

## 2. Storage 권한 설정

- SQL Editor 실행

```sql
-- 조회: 모든 사용자 (SNS 특성상 공개)
CREATE POLICY "Anyone can view uploads" ON storage.objects
FOR SELECT USING (bucket_id = 'uploads');

-- 업로드: 자신의 폴더에만 업로드 가능
CREATE POLICY "Users can upload to own folder" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 수정: 자신의 폴더 아래의 파일만 수정 가능
CREATE POLICY "Users can update own files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 삭제: 자신의 폴더 아래의 파일만 삭제 가능
CREATE POLICY "Users can delete own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'uploads' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

```

- Storage > 목록 > uploads > Policies 확인

## 3. 저장 및 Post 업데이트 하기

### 3.1. 버킷명 관리하기

- 관리를 편하게 하기 위해서 저장소 이름 관리
- `/src/lib/constants.ts` 업데이트

```ts
// 버킷 이름 : Supabase 저장소
export const BUCKET_NAME = 'uploads';
```

### 3.2. API 생성하기

- `/src/apis/image.ts 파일` 생성

```ts
import { BUCKET_NAME } from '@/lib/constants';
import supabase from '@/lib/supabase/client';

type ImageType = {
  file: File;
  filePath: string;
};
export async function uploadImage({ file, filePath }: ImageType) {
  // 파일을 업로드 함
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file);

  if (error) throw error;
  // 업로드된 파일의 URL 을 받아서 Post 에 이미지 목록(배열)에 저장
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

  return publicUrl;
}
```

### 3.3. API 만들기 : 포스트 생성 관련

- 단계 : 포스트 등록 > `포스트의 ID` 알아냄 > 파일 업로드 > 파일의 URL > 포스트 업데이트
- 생성되는 구조 : `사용자 ID 폴더 / 포스트 ID 폴더 / 파일들...`
- `/src/apis/post.ts` 기능 추가

```ts
import supabase from '@/lib/supabase/client';
import { uploadImage } from './image';
import { PostEntity, UpdatePostEntity } from '@/types/types';

export async function fetchPosts() {
  const { data, error } = await supabase.from('posts').select('*');
  // .eq('author_id', userId);
  if (error) throw error;
  return data;
}
// 1. 글 등록
export async function createPost(content: string) {
  const { data, error } = await supabase
    .from('posts')
    .insert({ content })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

// 2. 이미지와 함께 글 등록
type PostImageType = {
  userId: string;
  content: string;
  images: File[];
};
export async function createPostWithImages({
  userId,
  content,
  images,
}: PostImageType) {
  // 단계 1. 포스트 생성
  const post = await createPost(content);
  // 단계 2. 이미지 파일들이 있는지 검사함
  if (images.length === 0) return post;
  // 단계 3. 이미지 파일들이 존재한다면
  try {
    // 파일을 업로드 하는 것은 병렬로 진행함.
    // imageUrls :  업로드된 URL 목록들을 리턴 받음
    const imageUrls = await Promise.all(
      // images 파일 배열에서 하나씩 업로드를 병렬로 진행
      images.map(file => {
        // 1. 확장자 추출함.
        const fileExtension = file.name.split('.').pop() || 'webp';
        // 2. 고유한 이름을 생성
        const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;
        // 3. 파일의 업로드할 경로를 만들어 냄
        const filePath = `${userId}/${post.id}/${fileName}`;
        // 4. 파일 업로드 함.
        return uploadImage({ filePath, file });
      })
    );
    // 단계 4. 포스트를 업데이트 해줌. (업로드된 이미지들의 URL 을 기록해줘야함.)
    // 별도의 함수로 추출
    const updatePosts = updatePost({ image_urls: imageUrls, id: post.id });
    return updatePosts;
  } catch (error) {
    // 에러가 발생하면 포스트를 삭제해야함.
    // 별도의 함수로 추출
    await deletePost(post.id);
    throw error;
  }
}

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

// 4. 업로드 오류시 처리 함.
export async function deletePost(id: number) {
  const { data, error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;

  // 삭제된 아이템
  return data;
}
```

### 3.4. Mutation 함수 변경

- `/src/hooks/mutations/post/useCreatePost.ts` 변경

```ts
import { createPostWithImages } from '@/apis/post';
import { UseMutationCallback } from '@/types/types';
import { useMutation } from '@tanstack/react-query';

export function useCreatePost(callback?: UseMutationCallback) {
  return useMutation({
    // mutation 함수가 변경됨.
    // mutationFn: createPost,
    mutationFn: createPostWithImages,
    onSuccess: () => {
      if (callback?.onSuccess) callback.onSuccess();
    },
    onError: error => {
      if (callback?.onError) callback.onError(error);
    },
  });
}
```

### 3.5. 적용하기

- `/src/components/modal/PostEditorModal.tsx` 적용

```tsx
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
```

- 테스트 해보기 : posts 테이블, uploads 저장소 확인

## 4. 작성 중 닫힘 방지

- `/src/components/modal/PostEditorModal.tsx`

```tsx
const handleCloseModal = () => {
  close(); // 방지해보자
};
```

- 수정

```tsx
const handleCloseModal = () => {
  if (content !== '' || images.length !== 0) {
    // 안내창을 띄워서 확인후 닫기 실행처리
  }

  close(); // 방지해보자
};
```

### 4.1. AlertModal 을 생성해서 처리해 보자.

- `/src/components/modal/AlertModal.tsx 파일` 생성

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AleartModal() {
  return (
    <AlertDialog>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>헤더</AlertDialogTitle>
          <AlertDialogDescription>설명</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction>확인</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### 4.2. Store 로 전역 상태 관리

- `/src/stores/alertModalStore.ts 파일` 생성
- 단계 1.

```ts
import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';

const initialState = {};

const useAlertModalStore = create(
  devtools(
    combine(initialState, set => ({})),
    { name: 'AlertModalStore' }
  )
);
```

- 단계 2.

```ts
import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';

type CloseState = {
  isOpen: false;
};
type OpenState = {
  isOpen: true;
  title: string;
  description: string;
  onPositive?: () => void;
  onNegative?: () => void;
};
type State = CloseState | OpenState;

const initialState = {
  isOpen: false,
} as State;

const useAlertModalStore = create(
  devtools(
    combine(initialState, set => ({})),
    { name: 'AlertModalStore' }
  )
);
```

- 단계 3.

```ts
import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';

type CloseState = {
  isOpen: false;
};
type OpenState = {
  isOpen: true;
  title: string;
  description: string;
  onPositive?: () => void;
  onNegative?: () => void;
};
type State = CloseState | OpenState;

const initialState = {
  isOpen: false,
} as State;

const useAlertModalStore = create(
  devtools(
    combine(initialState, set => ({
      actions: {
        open: (params: Omit<OpenState, 'isOpen'>) => {
          set({ ...params, isOpen: true });
        },
        close: () => {
          set({ isOpen: false });
        },
      },
    })),
    { name: 'AlertModalStore' }
  )
);
```

### 4.3. `Omit<OpenState, "isOpen">`

- 문법적 설명

```ts
type OpenState = {
  isOpen: true;
  title: string;
  description: string;
  onPositive?: () => void;
  onNegative?: () => void;
};
```

- `Omit<OpenState, "isOpen">` 실행하면 생성되는 타입
- 아래처럼 `isOpen` 속성이 제거된다.

```ts
type OpenState = {
  title: string;
  description: string;
  onPositive?: () => void;
  onNegative?: () => void;
};
```

- 활용

```ts
{
 title: "정말 삭제하시겠습니까?";
  description: "삭제하시면 내용이 모두 제거됩니다.";
  onPositive?: () => console.log("확인 클릭");
  onNegative?: () => console.log("취소 클릭");
  }
```

### 4.4. 최종코드

```ts
import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';

type CloseState = {
  isOpen: false;
};
type OpenState = {
  isOpen: true;
  title: string;
  description: string;
  onPositive?: () => void;
  onNegative?: () => void;
};
type State = CloseState | OpenState;

const initialState = {
  isOpen: false,
} as State;

const useAlertModalStore = create(
  devtools(
    combine(initialState, set => ({
      actions: {
        open: (params: Omit<OpenState, 'isOpen'>) => {
          set({ ...params, isOpen: true });
        },
        close: () => {
          set({ isOpen: false });
        },
      },
    })),
    { name: 'AlertModalStore' }
  )
);

export const useOpenAlertModal = () => {
  const open = useAlertModalStore(store => store.actions.open);
  return open;
};

export const useCloseAlertModal = () => {
  const close = useAlertModalStore(store => store.actions.close);
  return close;
};

export const useAlertModal = () => {
  const store = useAlertModalStore();
  // 아래는 우리가 원하는 타입을 추가해서 리턴하기 위한 처리 ()
  return store as typeof store & State;
};
```

### 4.5. Store 활용하기

- `/src/components/modal/PostEditorModal.tsx`

```tsx
// 경고창
const openAlertModal = useOpenAlertModal();
```

- 적용하기

```tsx
const handleCloseModal = () => {
  if (content !== '' || images.length !== 0) {
    // 안내창을 띄워서 확인후 닫기 실행처리
    openAlertModal({
      title: '포스트 작성이 완료되지 않았습니다.',
      description: '화면에서 나가면 작성중이던 내용이 사라집니다.',
      onPositive: () => {
        close();
      },
      onNegative: () => {
        console.log('취소 클릭');
      },
    });
    return;
  }

  close(); // 방지해보자
};
```

### 4.6. 컴포넌트 적용하기

- `/src/components/modal/AlertModal.tsx` 적용

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAlertModal } from '@/stores/alertModalStore';

export default function AleartModal() {
  const store = useAlertModal();
  if (!store.isOpen) return null;
  const handleCancel = () => {
    if (store.onNegative) store.onNegative();
    store.actions.close();
  };
  const handleOk = () => {
    if (store.onPositive) store.onPositive();
    store.actions.close();
  };

  return (
    <AlertDialog>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{store.title}</AlertDialogTitle>
          <AlertDialogDescription>{store.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>취소</AlertDialogCancel>
          <AlertDialogAction onClick={handleOk}>확인</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### 4.7. 실제 화면에 출력시켜보기

- `/src/components/providers/ModalProvider.tsx` 추가

## 5. 이미지 캐시 지우기

- `/src/components/modal/PostEditorModal.tsx`

```tsx
// 자동 포커스 및 내용 초기화
useEffect(() => {
  if (!isOpen) return;

  // 웹브라우저의 캐시에 저장된 이미지 리셋
  images.forEach(img => {
    // 메모리 상에서 제거
    URL.revokeObjectURL(img.previewUrl);
  });

  textareaRef.current?.focus();
  setContent('');
  setImages([]);
}, [isOpen]);
```

## 6. Post 목록 출력

### 6.1. 목록 전용 컴포넌트

- `/src/components/post/PostFeed.tsx 파일` 생성

```tsx
'use client';
function PostFeed() {
  return <div>PostFeed</div>;
}

export default PostFeed;
```

- `/src/app/(protected)/page.tsx`

```tsx
import { CreatePostButton } from '@/components/post/CreatePostButton';
import PostFeed from '@/components/post/PostFeed';

export default function Home() {
  return (
    <div className='flex flex-col gap-10'>
      <CreatePostButton />
      <PostFeed />
    </div>
  );
}
```

### 6.2. Post 목록 API 작성

- `/src/apis/post.ts` 업데이트

```ts
// 5. 포스트 목록 조회
export async function fetchPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
```

## 7. 테이블의 외래키 설정하기

- Table > `posts`> Edit Table > Foreign keys
- Add foreign key relation 버튼 클릭
- Select a schema : `public`
- Select a table to reference to : `profiles`
- Select columns from public.profiles to reference to
- public.posts : `author_id`
- public.profiles : `id`
- Action if referenced row is updated : `Cascade`
- Action if referenced row is removedd : `Cascade`
- 저장 버튼 선택

### 7.1. 타입을 다시 생성해야 함.

```bash
npx supabase login
npm run generate-types
```

## 7. 무한 스크롤

## 8. Post 편집

## 9. Post 삭제

## 10. 목록 갱신
