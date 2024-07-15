import { ArrowsShuffle } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'ERC1967',
  path: '/erc-1967',
  description: 'Checks the ERC1967 proxy storage slots.',
  keywords: ['ERC1967', 'Proxy', 'Proxy Storage Slots'],
  component: () => import('./erc-1967.vue'),
  icon: ArrowsShuffle,
  createdAt: new Date('2024-07-16'),
});
