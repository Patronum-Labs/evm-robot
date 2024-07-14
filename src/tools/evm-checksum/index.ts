import { ArrowsShuffle } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Address Checksum',
  path: '/evm-checksum',
  description: 'Checksum an Ethereum Address',
  keywords: ['Checksum', 'Ethereum Address Checksum'],
  component: () => import('./evm-checksum.vue'),
  icon: ArrowsShuffle,
  createdAt: new Date('2024-07-14'),
});
