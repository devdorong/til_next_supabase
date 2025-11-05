import { fetchTodos } from '@/apis/todo';
import { useQuery } from '@tanstack/react-query';

export const useFetchTodos = () => {
  return useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
    // 10분
    staleTime: 1000,
    
  });
};
