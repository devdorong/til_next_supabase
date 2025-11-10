import { createProfile, fetchProfile } from '@/apis/profile';
import { QUERY_KEYS } from '@/lib/constants';
import { useSession } from '@/stores/session';
import type { PostgrestError } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';

export default function useProfileData(userId?: string) {
  // 나의 정보 확인
  const session = useSession();
  const isMine = userId === session?.user.id;

  return useQuery({
    queryKey: QUERY_KEYS.profile.byId(userId!),
    queryFn: async () => {
      try {
        const profile = await fetchProfile(userId!);
        return profile;
      } catch (error) {
        if (isMine && (error as PostgrestError).code === 'PGRST116') {
          // 기본 사용자 생성
          return await createProfile(userId!);
        }
        throw error;
      }
    },
    enabled: !!userId,
  });
}
