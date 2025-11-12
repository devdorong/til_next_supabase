import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';

type CloseState = {
  isOpen: false;
};
type OpenState = {
  isOpen: true;
  title: string;
  description: string;
  onPositive?: () => void;
  onNegative?: () => void;
};
type State = CloseState | OpenState;

const initialState = {
  isOpen: false,
} as State;

const useAlertModalStore = create(
  devtools(
    combine(initialState, set => ({
      actions: {
        open: (params: Omit<OpenState, 'isOpen'>) => {
          set({ ...params, isOpen: true });
        },
        close: () => {
          set({ isOpen: false });
        },
      },
    })),
    { name: 'AlertModalStore' }
  )
);

export const useOpenAlertModal = () => {
  const open = useAlertModalStore(store => store.actions.open);
  return open;
};

export const useCloseAlertModal = () => {
  const close = useAlertModalStore(store => store.actions.close);
  return close;
};

export const useAlertModal = () => {
  const store = useAlertModalStore();
  // 아래는 우리가 원하는 타입을 추가해서 리턴하기 위한 처리 ()
  return store as typeof store & State;
};
