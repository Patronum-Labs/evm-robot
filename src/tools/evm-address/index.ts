import { ArrowsShuffle } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Ethereum Address',
  path: '/evm-address',
  description: 'Given an Ethereum address, provides information about the address.',
  keywords: ['Address', 'nonce', 'storageRoot', 'codeHash', 'balance', 'code', 'storage'],
  component: () => import('./evm-address.vue'),
  icon: ArrowsShuffle,
  createdAt: new Date('2024-07-14'),
});
