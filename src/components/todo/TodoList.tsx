'use client';

import { useFetchTodos } from '@/hooks/todos/queries/useFetchTodos';
import TodoItem from './TodoItem';

function TodoList() {
  const { data: todos, isLoading, error } = useFetchTodos();

  if (isLoading) return <div>로딩중...</div>;
  if (error) return <div>에러입니다. {error.message}</div>;
  if (!todos) return <div>데이터가 없습니다.</div>;

  return (
    <div className='flex flex-col gap-2'>
      {todos.map(id => (
        <TodoItem key={id} id={id} />
      ))}
    </div>
  );
}

export default TodoList;
