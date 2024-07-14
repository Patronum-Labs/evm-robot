import { ArrowsShuffle } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'ERC20',
  path: '/erc-20',
  description: 'Checks the ERC20 standard common interface functions, including balance checks, info, and approvals.',
  keywords: ['ERC20', 'Fungible Token', 'Token'],
  component: () => import('./erc-20.vue'),
  icon: ArrowsShuffle,
  createdAt: new Date('2024-07-14'),
});
