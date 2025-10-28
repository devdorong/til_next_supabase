# 이메일 회원 로그인 구현

- `/src/app/signin/page.tsx`

## 1. UI 구성

```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

function SignIn() {
  return (
    <div className='flex flex-col gap-8'>
      <div className='text-xl font-bold'>로그인</div>
      <div className='flex flex-col gap-2'>
        <Input
          type='email'
          placeholder='example@example.com'
          className='py-6'
        />
        <Input type='password' placeholder='password' className='py-6' />
      </div>
      <div>
        <Button className='w-full'>로그인</Button>
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

## 2. 컴포넌트 State 구성

```tsx
'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import React, { useState } from 'react';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // 이메일로 로그인
  const handleSignInWithEmail = () => {
    if (!email.trim() || !password.trim()) return;
    // 이메일을 이용해서 로그인 진행
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
        />
        <Input
          value={password}
          onChange={e => setPassword(e.target.value)}
          type='password'
          placeholder='password'
          className='py-6'
        />
      </div>
      <div>
        <Button className='w-full py-6' onClick={handleSignInWithEmail}>
          로그인
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

## 3. api 구성

- `/src/apis/auth.ts` 기능 추가

```ts
// supabase 백엔드에 사용자 이메일 로그인
export async function signInWithEmail({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  // 웹브라우저를 이용해서 이메일 로그인
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;

  return data;
}
```

## 4. mutation 구성

```ts
import { signInWithEmail } from '@/apis/auth';
import { useMutation } from '@tanstack/react-query';

export function useSignIn() {
  return useMutation({ mutationFn: signInWithEmail });
}
```

## 5. 적용하기

```tsx
'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSignIn } from '@/hooks/mutations/useSignIn';
import Link from 'next/link';
import React, { useState } from 'react';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { mutate, isPending, isError } = useSignIn();
  // 이메일로 로그인
  const handleSignInWithEmail = () => {
    if (!email.trim() || !password.trim()) return;
    // 이메일을 이용해서 로그인 진행
    if (isError) {
      return <div>로그인에러 에러입니다.</div>;
    }

    // supabase 로그인
    mutate({ email, password });
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
          disabled={isPending}
        />
        <Input
          value={password}
          onChange={e => setPassword(e.target.value)}
          type='password'
          placeholder='password'
          className='py-6'
          disabled={isPending}
        />
      </div>
      <div>
        <Button
          className='w-full py-6'
          onClick={handleSignInWithEmail}
          disabled={isPending}
        >
          {isPending ? '로그인중...' : '로그인'}
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

# Supabase 카카오 로그인

## 1. 카카오 개발자 앱 등록 및 supabase 셋팅

- https://developers.kakao.com/

## 2. UI 구성하기

- `/src/app/signin/page.tsx` 추가

```tsx
/* 카카오 소셜 로그인 */
<Button className='w-full py-6 bg-yellow-400 font-bold'>카카오 로그인</Button>
```

## 3. api 구성하기

- `/src/apis/auth.ts` 추가

```ts
import type { Provider } from '@supabase/auth-js';

// 소셜 로그인
export async function signInWithOAuth(provider: Provider) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
  });
  if (error) throw error;
  return data;
}
```

## 4. mutation 구성하기

- `/src/hooks/mutations/useSingInWithKakao.ts 파일` 생성

```ts
import { signInWithOAuth } from '@/apis/auth';
import { useMutation } from '@tanstack/react-query';

export function useSignInWithKakao() {
  return useMutation({
    mutationFn: signInWithOAuth,
  });
}
```

## 5. 적용하기

```tsx
'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSignIn } from '@/hooks/mutations/useSignIn';
import { useSignInWithKakao } from '@/hooks/mutations/useSingInWithKakao';
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
          className='w-full py-6 bg-yellow-400 font-bold'
          onClick={handleSignWithKakao}
          disabled={isPendingKakao}
        >
          카카오 로그인
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
