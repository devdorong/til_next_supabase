# Supabase 구글 로그인

## 1. 개발자 사이트 등록 및 Supabase 셋팅

- https://cloud.google.com/cloud-console?hl=ko

## 2. UI 작성

- `/src/app/signin/page.tsx 업데이트`

```tsx
<Button
  className='w-full py-6 bg-gray-50 border text-gray-500 font-bold hover:bg-gray-300' // onClick={handleSignWithKakao}
  // disabled={isPendingKakao}
>
  Google 로그인
</Button>
```

## 3. API 작성

- `/src/apis/auth.ts` 기능 재활용

## 4. Mutation 작성

- `/src/hooks/mutations/useSignInWithGoogle.ts 파일` 생성

```ts
import { signInWithOAuth } from '@/apis/auth';
import { useMutation } from '@tanstack/react-query';

export function useSignInWithGoogle() {
  return useMutation({
    mutationFn: signInWithOAuth,
  });
}
```

## 5. 활용하기

```tsx
'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSignIn } from '@/hooks/mutations/useSignIn';
import { useSignInWithGoogle } from '@/hooks/mutations/useSignInWithGoogle';
import { useSignInWithKakao } from '@/hooks/mutations/useSignInWithKakao';
import Link from 'next/link';
import React, { useState } from 'react';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {
    mutate: mutateEmail,
    isPending: isPendingEmail,
    isError: isErrorEmail,
  } = useSignIn();
  const {
    mutate: mutateKakao,
    isPending: isPendingKakao,
    isError: isErrorKakao,
  } = useSignInWithKakao();
  const {
    mutate: mutateGoogle,
    isPending: isPendingGoogle,
    isError: isErrorGoogle,
  } = useSignInWithGoogle();

  // 이메일로 로그인
  const handleSignInWithEmail = () => {
    if (!email.trim() || !password.trim()) return;
    // 이메일을 이용해서 로그인 진행
    if (isErrorEmail) {
      return <div>이메일 로그인 에러입니다.</div>;
    }

    // supabase 로그인
    mutateEmail({ email, password });
  };
  // 카카오 로그인
  const handleSignWithKakao = () => {
    if (isErrorKakao) {
      return <div>카카오 로그인 에러 입니다.</div>;
    }

    mutateKakao('kakao');
  };

  // 구글 로그인
  const handleSignWithGoogle = () => {
    if (isErrorGoogle) {
      return <div>구글 로그인 에러 입니다.</div>;
    }
    mutateGoogle('google');
  };
  return (
    <div className='flex flex-col gap-8'>
      <div className='text-xl font-bold'>로그인</div>
      <div className='flex flex-col gap-2'>
        <Input
          value={email}
          onChange={e => setEmail(e.target.value)}
          type='email'
          placeholder='example@example.com'
          className='py-6'
          disabled={isPendingEmail}
        />
        <Input
          value={password}
          onChange={e => setPassword(e.target.value)}
          type='password'
          placeholder='password'
          className='py-6'
          disabled={isPendingEmail}
        />
      </div>
      <div className='flex flex-col gap-2'>
        {/* 비밀번호 로그인 */}
        <Button
          className='w-full py-6'
          onClick={handleSignInWithEmail}
          disabled={isPendingEmail}
        >
          {isPendingEmail ? '로그인중...' : '로그인'}
        </Button>
        {/* 카카오 소셜 로그인 */}
        <Button
          className='w-full py-6 bg-yellow-400 font-bold hover:bg-yellow-600'
          onClick={handleSignWithKakao}
          disabled={isPendingKakao}
        >
          카카오 로그인
        </Button>
        {/* 구글 소셜 로그인 */}
        <Button
          className='w-full py-6 bg-gray-50 border text-gray-500 font-bold hover:bg-gray-300'
          onClick={handleSignWithGoogle}
          disabled={isPendingGoogle}
        >
          Google 로그인
        </Button>
      </div>
      <div className='flex justify-end'>
        <Link
          href={'/signup'}
          className='text-muted-foreground hover:underline '
        >
          계정이 없으시다면? 회원가입
        </Link>
      </div>
    </div>
  );
}

export default SignIn;
```
