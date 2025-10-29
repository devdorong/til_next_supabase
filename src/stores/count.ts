import { create } from 'zustand';
import { combine } from 'zustand/middleware';

// create(combine(스토어에 포함될 State 객체, 콜백함수));
// create(combine({ count: 0 }, 콜백함수));
// create(combine({ count: 0 }, ()=>{}));
// create(combine({ count: 0 }, (set,get)=> (리턴객체)));
create(combine({ count: 0 }, (set,get)=> ({})));

type CountStoreType = {
  count: number;
  actions: {
    increment: () => void;
    decrement: () => void;
  };
};

export const useCountStore = create<CountStoreType>((set, get) => {
  return {
    count: 0,
    actions: {
      increment: () => {
        set(store => ({ count: store.count + 1 }));
      },
      decrement: () => {
        set(store => ({ count: store.count - 1 }));
      },
    },
  };
});

// 전용 훅들
export const useCount = () => {
  const count = useCountStore(store => store.count);
  return count;
};
export const useIncrement = () => {
  const increment = useCountStore(store => store.actions.increment);
  return increment;
};
export const useDecrement = () => {
  const decrement = useCountStore(store => store.actions.decrement);
  return decrement;
};
