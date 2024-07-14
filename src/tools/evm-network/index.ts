import { ArrowsShuffle } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'EVM Network',
  path: '/evm-network',
  description: 'Gets information of an EVM blockchain',
  keywords: ['Blockchain', 'EVM', 'Blockchain Info'],
  component: () => import('./evm-network.vue'),
  icon: ArrowsShuffle,
  createdAt: new Date('2024-07-14'),
});
