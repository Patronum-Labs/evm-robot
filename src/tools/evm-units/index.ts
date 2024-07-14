import { ArrowsShuffle } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Units Conversion',
  path: '/evm-units',
  description: 'Converts different Ethereum units',
  keywords: ['units', 'wei', 'gwei', 'ether', 'finney', 'szabo', 'weiToEther', 'formatUnits', 'parseUnits'],
  component: () => import('./evm-units.vue'),
  icon: ArrowsShuffle,
  createdAt: new Date('2024-07-14'),
});
