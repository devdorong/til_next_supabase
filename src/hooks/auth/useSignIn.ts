import { signInWithEmail } from '@/apis/auth';
import { UseMutationCallback } from '@/types/types';
import { useMutation } from '@tanstack/react-query';

export function useSignIn(callback?: UseMutationCallback) {
  return useMutation({
    mutationFn: signInWithEmail,
    // 자동으로 error 전달 받음
    onError: error => {
      console.error(error);
      if (callback?.onError) callback.onError(error);
    },
  });
}

// if (callback?.onSucces) callback.onSucces();
