'use client';

import { useCount } from '@/stores/count';

const Viewer = () => {
  const count = useCount();
  return <div>Count: {count}</div>;
};

export default Viewer;
