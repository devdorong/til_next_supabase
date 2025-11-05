'use client';
import { useTodoDataById } from '@/hooks/todos/queries/useDataById';

const TodoDetail = ({ id }: { id: number }) => {
  const { data: todo, error, isLoading } = useTodoDataById(id);

  if (isLoading) return <div>로딩중...</div>;
  if (error) return <div>에러입니다. {error.message}</div>;
  if (!todo) return <div>데이터가 없습니다.</div>;

  return (
    <div>
      <h2>할일 제목 : {todo.title}</h2>
      <div>
        <div>{todo.completed ? '했다' : '안했다'}</div>
      </div>
    </div>
  );
};

export default TodoDetail;
