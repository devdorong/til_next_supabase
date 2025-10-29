'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSignIn } from '@/hooks/mutations/useSignIn';
import { useSignInWithGoogle } from '@/hooks/mutations/useSignInWithGoogle';
import { useSignInWithKakao } from '@/hooks/mutations/useSignInWithKakao';
import { getErrorMessage } from '@/lib/error';
import Link from 'next/link';
import React, { useState } from 'react';
import { toast } from 'sonner';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 이메일로 로그인
  const { mutate: mutateEmail, isPending: isPendingEmail } = useSignIn({
    onError: error => {
      setPassword('');
      // Sonner 로 띄우기
      // 한글 메시지로 교체
      const message = getErrorMessage(error);
      toast.error(message, { position: 'top-center' });
    },
  });

  const { mutate: mutateKakao, isPending: isPendingKakao } = useSignInWithKakao(
    {
      onError: error => {
        // Sonner 로 띄우기
        // 한글 메시지로 교체
        const message = getErrorMessage(error);
        toast.error(message, { position: 'top-center' });
      },
    }
  );
  
  const { mutate: mutateGoogle, isPending: isPendingGoogle } =
    useSignInWithGoogle({
      onError: error => {
        setPassword('');
        // Sonner 로 띄우기
        // 한글 메시지로 교체
        const message = getErrorMessage(error);
        toast.error(message, { position: 'top-center' });
      },
    });

  // 이메일로 로그인
  const handleSignInWithEmail = () => {
    if (!email.trim() || !password.trim()) return;
    // 이메일을 이용해서 로그인 진행

    // supabase 로그인
    mutateEmail({ email, password });
  };
  // 카카오 로그인
  const handleSignWithKakao = () => {
    mutateKakao('kakao');
  };

  // 구글 로그인
  const handleSignWithGoogle = () => {
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
