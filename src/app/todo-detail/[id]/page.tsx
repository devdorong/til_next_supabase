import TodoDetail from '@/components/todo/TodoDetail';

type TodoDetailPageProps = {
  params: Promise<{ id: number }>;
};

export default async function TodoDetailPage({ params }: TodoDetailPageProps) {
  const { id } = await params;

  return <TodoDetail id={id} />;
}
