import { ArrowsShuffle } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'ERC725',
  path: '/erc-725',
  description:
    'Calls ERC725 contract with getData and getDataBatch functions to get the data stored inside below dataKeys.',
  keywords: ['ERC725', 'ERC725Y', 'generic-key-value-store'],
  component: () => import('./erc-725.vue'),
  icon: ArrowsShuffle,
  createdAt: new Date('2024-07-14'),
});
