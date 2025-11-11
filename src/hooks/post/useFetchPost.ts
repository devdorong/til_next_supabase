import { fetchPosts } from '@/apis/post';
import { UseMutationCallback } from '@/types/types';
import { useMutation } from '@tanstack/react-query';

export function useFetchPost(callback?: UseMutationCallback) {
  return useMutation({
    mutationFn: fetchPosts,
    onSuccess: () => {
      if (callback?.onSuccess) callback.onSuccess();
    },
    onError: error => {
      if (callback?.onError) callback.onError(error);
    },
  });
}
