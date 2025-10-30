import { create } from 'zustand';
import { combine } from 'zustand/middleware';

create(combine({}, () => ({})));
