import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';

type CreateMode = {
  isOpen: true;
  type: 'CREATE';
};

type EditMode = {
  isOpen: true;
  type: 'EDIT';

  postId: number;
  content: string;
  imageUrls: string[] | null;
};

type OpenState = CreateMode | EditMode;

type CloseState = {
  isOpen: false;
};

type State = CloseState | OpenState;

const initialState = {
  isOpen: false,
} as State;

const usePostEditorStore = create(
  devtools(
    combine(initialState, set => ({
      actions: {
        openCreate: () => {
          set({ isOpen: true, type: 'CREATE' });
        },
        openEdit: (params: Omit<EditMode, 'isOpen' | 'type'>) => {
          set({ isOpen: true, type: 'EDIT', ...params });
        },
        close: () => {
          set({ isOpen: false });
        },
      },
    })),
    { name: 'PostEditorStore' }
  )
);

export const useOpenCreatePostEditorModal = () => {
  const openCreate = usePostEditorStore(store => store.actions.openCreate);
  return openCreate;
};
export const useOpenEditPostEditorModal = () => {
  const openEdit = usePostEditorStore(store => store.actions.openEdit);
  return openEdit;
};

export const useClosePostEditorModal = () => {
  const close = usePostEditorStore(store => store.actions.close);
  return close;
};

export const usePostEditorModal = () => {
  const store = usePostEditorStore();
  return store as typeof store & State;
};
