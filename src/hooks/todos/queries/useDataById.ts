import { fetchTodoById } from '@/apis/todo';
import { QUERY_KEYS } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';

export const useTodoDataById = (id: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.todo.detail(id.toString()),
    queryFn: () => fetchTodoById(id),

    // 5초동안 fresh 유효기간
    staleTime: 5000,

    // 10 초동안 inactive 유효기간
    gcTime: 10000,
  });
};
