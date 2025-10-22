// React Query의 상태를 Zustand 에서 관리하기 위한 스토어

import { QueryState } from '@/types/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 1단계 타입정의
// interface QueryState {
//   // State
//   selectedUserId: number | null; // 현재 선택된 사용자 ID
//   selectedPostId: number | null; // 현재 선택된 게시글 ID
//   // Action
//   setSelectedUserId: (userId: number | null) => void; // 선택된 사용자 ID 설정
//   setSelectedPostId: (postId: number | null) => void; // 선택된 게시글 ID 설정
// }
// 2 단계 - store 구현(localStorage 활용)
const queryLocalStore = create<QueryState>()(
  persist(
    set => ({
      // 초기 state 설정
      selectedUserId: null, // 처음에 선택된 사용자 ID 없음
      selectedPostId: null, // 처음에 선택된 게시글 ID 없음
      // 초기 action 기능 설정
      setSelectedUserId: (userId: number | null) => {
        set({ selectedUserId: userId });
      },
      setSelectedPostId: (postId: number | null) => {
        set({ selectedPostId: postId });
      },
    }),
    {
      name: 'query-storage', // localStorage 에 저장될 키 이름
      partialize: state => ({
        // localStorage 에 보관할 state 지정 가능
        selectedUserId: state.selectedUserId,
        selectedPostId: state.selectedPostId,
      }),
    }
  )
);
// 3 단계 - custom Hook 정의

export const useQueryStore = () => {
  const ctx = queryLocalStore();
  return ctx;
};
