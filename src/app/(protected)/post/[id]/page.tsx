interface PostDetailPageProps {
  params: {
    id: string;
  };
}

function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = params;
  return <div>{id}PostDetailPage</div>;
}

export default PostDetailPage;
