import TodoEditor from '@/components/todo/TodoEditor';
import TodoList from '@/components/todo/TodoList';

export default function TodoListPage() {
  return (
    <div className='flex flex-col gap-5 p-5'>
      <h1 className='text-2xl font-bold'>Todo List</h1>
      <TodoEditor />
      <TodoList />
    </div>
  );
}
