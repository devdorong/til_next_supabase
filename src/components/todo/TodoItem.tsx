'use client';
import { useTodoDataById } from '@/hooks/todos/queries/useDataById';
import Link from 'next/link';
import { Button } from '../ui/button';
import { useUpdateTodoMutation } from '@/hooks/todos/mutations/useUpdateTodoMutation';

export default function TodoItem({ id }: { id: number }) {
  // 캐시된 데이터를 활용한다.
  const { data: todo } = useTodoDataById(id, 'LIST');
  if (!todo) throw new Error('현재 Todo 가 없어요');
  const { completed, title } = todo;

  // hook 활용하기
  const { mutate: updateTodo } = useUpdateTodoMutation();

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateTodo({ id, completed: !completed });
  };

  const handleDeleteClick = () => {};

  return (
    <div className='flex items-center justify-between border p-2'>
      <div className='flex gap-5'>
        <input
          type='checkbox'
          checked={completed}
          onChange={handleCheckboxChange}
        />
        <Link href={`/todo-detail/${id}`}>{title}</Link>
      </div>
      <Button onClick={handleDeleteClick} variant={'destructive'}>
        삭제
      </Button>
    </div>
  );
}
