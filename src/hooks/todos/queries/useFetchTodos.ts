import { fetchTodos } from '@/apis/todo';
import { QUERY_KEYS } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';

export const useFetchTodos = () => {
  return useQuery({
    queryKey: QUERY_KEYS.todo.list,
    queryFn: fetchTodos,
    // 10분
    staleTime: 1000,
  });
};
