import { ArrowsShuffle } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'NameHash Algorithm',
  path: '/evm-namehash',
  description: 'Precalculate hash of a string according to the NameHash algorithm',
  keywords: ['nameHash', 'ENS', 'normalize', 'hash'],
  component: () => import('./evm-namehash.vue'),
  icon: ArrowsShuffle,
  createdAt: new Date('2024-07-14'),
});
