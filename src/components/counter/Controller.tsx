'use client';

import { useDecrement, useIncrement } from '@/stores/count';
import { Button } from '../ui/button';

const Controller = () => {
  // Selector 함수 활용
  const increment = useIncrement();
  const decrement = useDecrement();

  return (
    <div className='flex gap-2'>
      <Button onClick={decrement}>감소</Button>
      <Button onClick={increment}>증가</Button>
    </div>
  );
};

export default Controller;
