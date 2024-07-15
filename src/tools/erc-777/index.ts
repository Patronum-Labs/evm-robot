import { ArrowsShuffle } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'ERC777',
  path: '/erc-777',
  description: 'Checks the ERC777 standard common interface functions, including balance checks, info, and approvals.',
  keywords: ['ERC777', 'Fungible Token', 'Token'],
  component: () => import('./erc-777.vue'),
  icon: ArrowsShuffle,
  createdAt: new Date('2024-07-16'),
});
