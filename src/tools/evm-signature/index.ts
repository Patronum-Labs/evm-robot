import { ArrowsShuffle } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'Recover Signature',
  path: '/evm-signature',
  description: 'Recover the signer of a message signed from a signature and a hash.',
  keywords: ['signature', 'signature recover', 'ecdsa', 'secp256k1', 'vrs'],
  component: () => import('./evm-signature.vue'),
  icon: ArrowsShuffle,
  createdAt: new Date('2024-07-14'),
});
