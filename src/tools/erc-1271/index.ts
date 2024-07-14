import { ArrowsShuffle } from '@vicons/tabler';
import { defineTool } from '../tool';

export const tool = defineTool({
  name: 'ERC1271',
  path: '/erc-1271',
  description:
    'Calls the contract with isValidSignature(bytes32,bytes) function, and return whether the signature is valid or not',
  keywords: ['ERC1271', 'isValidSignature', 'Smart contract Signature', 'SIWE'],
  component: () => import('./erc-1271.vue'),
  icon: ArrowsShuffle,
  createdAt: new Date('2024-07-14'),
});
