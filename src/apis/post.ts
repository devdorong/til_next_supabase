import supabase from '@/lib/supabase/client';

export async function fetchPosts() {
  const { data, error } = await supabase.from('posts').select('*');
  // .eq('author_id', userId);
  if (error) throw error;
  return data;
}
// 글등록
export async function createPost(content: string) {
  const { data, error } = await supabase.from('posts').insert({ content });
  if (error) throw error;
  return data;
}
