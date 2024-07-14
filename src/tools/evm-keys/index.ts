import { ArrowsShuffle } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Private-Public Key',
  path: '/evm-keys',
  description: 'Derive the public key and address from a private key.',
  keywords: ['public key', 'private key', 'address', 'compressed public key', 'uncompressed public key'],
  component: () => import('./evm-keys.vue'),
  icon: ArrowsShuffle,
  createdAt: new Date('2024-07-14'),
});
