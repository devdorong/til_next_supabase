import { fetchTodos } from '@/apis/todo';
import { QUERY_KEYS } from '@/lib/constants';
import { Todo } from '@/types/todo-type';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useFetchTodos = () => {
  // 전역에서 관리하는 React Query 상태 참조
  const queryClinet = useQueryClient();
  return useQuery({
    queryKey: QUERY_KEYS.todo.list,
    queryFn: async () => {
      const todos = await fetchTodos();
      // console.log(todos);

      // 평탄화 작업
      todos.forEach(todo => {
        // 개별 캐시 데이터들까지 함께 보관하도록 설정
        queryClinet.setQueryData<Todo>(
          QUERY_KEYS.todo.detail(todo.id.toString()),
          todo
        );
      });

      // todo 의 id 값만 따로 모아서 배열로 캐시해둔다.
      return todos.map(item => item.id);
    },
  });
};
