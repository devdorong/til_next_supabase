import Controller from '@/components/counter/Controller';
import Viewer from '@/components/counter/Viewer';

function CounterPage() {
  return (
    <div className='flex flex-col justify-center items-center gap-4'>
      <h1 className='text-2x1 font-bold '>Counter</h1>
      <Viewer />
      <Controller />
    </div>
  );
}

export default CounterPage;

